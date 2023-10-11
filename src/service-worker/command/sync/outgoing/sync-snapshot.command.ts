/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { SegmentData, SegmentImg, SegmentPage, SegmentType } from '@pinmenote/page-compute';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { PageSegmentGetCommand } from '../../../../common/command/snapshot/segment/page-segment-get.command';
import { SyncObjectCommand } from './sync-object.command';
import { SyncObjectStatus } from '../../../../common/model/sync.model';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { BeginTxResponse, SyncHashType } from '../../api/store/api-store.model';
import { PageSnapshotDto } from '../../../../common/model/obj/page-snapshot.dto';
import { ApiSegmentAddCommand } from '../../api/store/segment/api-segment-add.command';
import { SyncCryptoFactory } from '../crypto/sync-crypto.factory';

export class SyncSnapshotCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private authUrl: string, private obj: ObjDto<ObjPageDto>, private tx: BeginTxResponse) {}
  async execute(): Promise<SyncObjectStatus> {
    const page = this.obj.data;
    const snapshot = page.snapshot;
    if (!snapshot.hash) {
      fnConsoleLog('SyncSnapshotCommand', snapshot);
      throw new Error('SyncSnapshotCommand->PROBLEM !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      return SyncObjectStatus.SERVER_ERROR;
    }
    await new SyncObjectCommand(this.obj, snapshot.hash, this.tx).execute();
    await this.syncSnapshot(snapshot, snapshot.hash);
    // TODO await this.syncComments(page.comments, snapshot.hash);
    if (!snapshot.segment) {
      fnConsoleLog('SyncSnapshotCommand->!!!!!!!!!!!!1SEGMENT->EMPTY', snapshot.segment, this.obj);
      return SyncObjectStatus.OK;
    }
    await this.syncAllSegments(snapshot, snapshot.hash);
    return SyncObjectStatus.OK;
  }

  private syncAllSegments = async (snapshot: PageSnapshotDto, parent: string): Promise<void> => {
    // Sync first segment
    const segment = await new PageSegmentGetCommand(snapshot.segment).execute();
    if (!segment) return;
    const content = this.getSegmentContent(segment);
    if (!content) return;
    await new ApiSegmentAddCommand(this.authUrl, this.tx, content, {
      key: await SyncCryptoFactory.newKey(),
      type: SyncHashType.PageSnapshotFirstHash,
      hash: segment.hash,
      parent
    }).execute();
    await this.syncSegmentSnapshot(segment.content as SegmentPage, parent);
  };

  private async syncSnapshot(snapshot: PageSnapshotDto, parent: string): Promise<void> {
    // snapshot->info
    await new ApiSegmentAddCommand(this.authUrl, this.tx, JSON.stringify(snapshot.info), {
      key: await SyncCryptoFactory.newKey(),
      type: SyncHashType.PageSnapshotInfoDto,
      hash: snapshot.info.hash,
      parent
    }).execute();
    // snapshot->data
    await new ApiSegmentAddCommand(this.authUrl, this.tx, JSON.stringify(snapshot.data), {
      key: await SyncCryptoFactory.newKey(),
      type: SyncHashType.PageSnapshotDataDto,
      hash: snapshot.data.hash,
      parent
    }).execute();
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  /*private async syncComments(commentList: ObjCommentListDto, parent: string): Promise<void> {
    fnConsoleLog('SyncSnapshotCommand->syncComments');
  }*/

  private syncSegment = async (hash: string, parent: string) => {
    const segment = await new PageSegmentGetCommand(hash).execute();
    if (!segment) return;
    const content = this.getSegmentContent(segment);
    if (!content) return;

    await new ApiSegmentAddCommand(this.authUrl, this.tx, content, {
      key: await SyncCryptoFactory.newKey(),
      type: this.convertSegmentTypeSyncHashType(segment.type),
      hash,
      parent
    }).execute();

    switch (segment.type) {
      case SegmentType.SNAPSHOT: {
        await this.syncSegmentSnapshot(segment.content as SegmentPage, parent);
        break;
      }
      case 3 as SegmentType: // FIXME - remove later - SHADOW - obsolete - no longer exists
      case SegmentType.CSS:
      case SegmentType.IMG: {
        break;
      }
      case SegmentType.IFRAME: {
        const content = segment.content as SegmentPage;
        for (const css of content.css) {
          await this.syncSegment(css, parent);
        }
        for (const asset of content.assets) {
          await this.syncSegment(asset, parent);
        }
        break;
      }
      default:
        fnConsoleLog('segment !!!', segment);
        throw new Error('SyncSnapshotCommand->Problem !!!!!!!!!!!!!!!!!!!!!!');
    }
  };

  private getSegmentContent = (segment: SegmentData<any>): string | undefined => {
    if (segment.type === (3 as SegmentType)) return;
    if (segment.type == SegmentType.IMG) return (segment.content as SegmentImg).src;
    return JSON.stringify(segment.content);
  };

  private syncSegmentSnapshot = async (content: SegmentPage, parent: string): Promise<void> => {
    for (const css of content.css) {
      await this.syncSegment(css, parent);
    }
    for (const asset of content.assets) {
      await this.syncSegment(asset, parent);
    }
  };

  private convertSegmentTypeSyncHashType(type: SegmentType): SyncHashType {
    switch (type) {
      case SegmentType.IFRAME:
        return SyncHashType.IFrame;
      case SegmentType.IMG:
        return SyncHashType.Img;
      case SegmentType.CSS:
        return SyncHashType.Css;
      case SegmentType.SNAPSHOT:
        return SyncHashType.Snapshot;
      default:
        fnConsoleLog('convertSegmentTypeSyncHashType', type);
        throw new Error('PROBLEM !!!!!!!!!!!!!!!!!!!!');
    }
  }
}
