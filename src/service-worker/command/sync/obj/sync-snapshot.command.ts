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
import { SegmentCss, SegmentImg, SegmentPage, SegmentType } from '@pinmenote/page-compute';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { PageSegmentGetCommand } from '../../../../common/command/snapshot/segment/page-segment-get.command';
import { SyncObjectCommand } from './sync-object.command';
import { SyncHashType, SyncObjectStatus, SyncProgress } from '../sync.model';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { BeginTxResponse } from '../../api/store/api-store.model';
import { ObjCommentListDto } from '../../../../common/model/obj/obj-comment.dto';
import { PageSnapshotDto } from '../../../../common/model/obj/page-snapshot.dto';
import { ApiSegmentAddCommand } from '../../api/store/segment/api-segment-add.command';

export class SyncSnapshotCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private obj: ObjDto<ObjPageDto>, private progress: SyncProgress, private tx: BeginTxResponse) {}
  async execute(): Promise<SyncObjectStatus> {
    const page = this.obj.data;
    const snapshot = page.snapshot;
    if (!snapshot.hash) {
      fnConsoleLog('SyncSnapshotCommand', snapshot);
      throw new Error('PROBLEM !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      return SyncObjectStatus.SERVER_ERROR;
    }
    await new SyncObjectCommand(this.obj, snapshot.hash, this.tx).execute();
    await this.syncSnapshot(snapshot, snapshot.hash);
    await this.syncComments(page.comments, snapshot.hash);
    return SyncObjectStatus.SERVER_ERROR;
    // await this.syncSegment(snapshot.hash);
  }

  private async syncSnapshot(snapshot: PageSnapshotDto, hash: string): Promise<void> {
    // snapshot->info
    await new ApiSegmentAddCommand(this.tx.tx, JSON.stringify(snapshot.info), {
      hash: snapshot.info.hash,
      parent: hash,
      type: SyncHashType.PageSnapshotInfoDto,
      key: 'foo'
    }).execute();
    // snapshot->data
    await new ApiSegmentAddCommand(this.tx.tx, JSON.stringify(snapshot.data), {
      hash: snapshot.data.hash,
      parent: hash,
      type: SyncHashType.PageSnapshotDataDto,
      key: 'foo'
    }).execute();
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  private async syncComments(commentList: ObjCommentListDto, hash: string): Promise<void> {
    fnConsoleLog('SyncSnapshotCommand->syncComments');
  }

  private async syncSegment(hash: string) {
    const segment = await new PageSegmentGetCommand(hash).execute();
    if (!segment) return;
    switch (segment.type) {
      case SegmentType.SNAPSHOT: {
        fnConsoleLog('SNAPSHOT');
        const content = segment.content as SegmentPage;
        for (const css of content.css) {
          await this.syncSegment(css);
        }
        for (const asset of content.assets) {
          await this.syncSegment(asset);
        }
        break;
      }
      case SegmentType.CSS: {
        // fnConsoleLog('CSS');
        const content = segment.content as SegmentCss;
        break;
      }
      case SegmentType.IMG: {
        // fnConsoleLog('IMG');
        const content = segment.content as SegmentImg;
        break;
      }
      case SegmentType.IFRAME: {
        const content = segment.content as SegmentPage;
        for (const css of content.css) {
          await this.syncSegment(css);
        }
        for (const asset of content.assets) {
          await this.syncSegment(asset);
        }
        break;
      }
    }
  }
}
