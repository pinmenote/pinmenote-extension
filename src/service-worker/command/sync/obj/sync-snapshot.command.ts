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
import { SegmentPage, SegmentType, SegmentImg } from '@pinmenote/page-compute';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { PageSegmentGetCommand } from '../../../../common/command/snapshot/segment/page-segment-get.command';
import { SyncObjectCommand } from './sync-object.command';
import { SyncHashType, SyncObjectStatus } from '../sync.model';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { BeginTxResponse } from '../../api/store/api-store.model';
import { PageSnapshotDto } from '../../../../common/model/obj/page-snapshot.dto';
import { ApiSegmentAddCommand } from '../../api/store/segment/api-segment-add.command';
import { fnB64toBlob } from '../../../../common/fn/fn-b64-to-blob';

const TEMP_KEY = 'foo';

export class SyncSnapshotCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private obj: ObjDto<ObjPageDto>, private tx: BeginTxResponse) {}
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
    await this.syncSegment(snapshot.segment, snapshot.hash);
    return SyncObjectStatus.OK;
  }

  private async syncSnapshot(snapshot: PageSnapshotDto, parent: string): Promise<void> {
    // snapshot->info
    await new ApiSegmentAddCommand(this.tx, JSON.stringify(snapshot.info), {
      hash: snapshot.info.hash,
      parent,
      type: SyncHashType.PageSnapshotInfoDto,
      key: TEMP_KEY
    }).execute();
    // snapshot->data
    await new ApiSegmentAddCommand(this.tx, JSON.stringify(snapshot.data), {
      hash: snapshot.data.hash,
      parent,
      type: SyncHashType.PageSnapshotDataDto,
      key: TEMP_KEY
    }).execute();
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  /*private async syncComments(commentList: ObjCommentListDto, parent: string): Promise<void> {
    fnConsoleLog('SyncSnapshotCommand->syncComments');
  }*/

  private async syncSegment(hash: string, parent: string) {
    const segment = await new PageSegmentGetCommand(hash).execute();
    if (!segment) return;
    let content: string | Blob | undefined;
    if (segment.type === (3 as SegmentType)) return;
    if (segment.type == SegmentType.IMG) {
      const src = (segment.content as SegmentImg).src;
      if (src.startsWith('data:image/svg') || src === 'data:') {
        content = src;
      } else {
        content = fnB64toBlob(src);
      }
    } else {
      content = JSON.stringify(segment.content);
    }

    await new ApiSegmentAddCommand(this.tx, content, {
      hash,
      parent,
      type: this.convertSegmentTypeSyncHashType(segment.type),
      key: TEMP_KEY
    }).execute();

    switch (segment.type) {
      case SegmentType.SNAPSHOT: {
        const content = segment.content as SegmentPage;
        for (const css of content.css) {
          await this.syncSegment(css, parent);
        }
        for (const asset of content.assets) {
          await this.syncSegment(asset, parent);
        }
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
  }

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
