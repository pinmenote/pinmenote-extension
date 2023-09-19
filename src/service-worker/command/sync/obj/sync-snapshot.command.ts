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
import { SyncObjectStatus } from './sync-index.command';
import { SyncProgress } from '../sync.model';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

export class SyncSnapshotCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private obj: ObjDto<ObjPageDto>, private progress: SyncProgress) {}
  async execute(): Promise<SyncObjectStatus> {
    const snapshot = this.obj.data.snapshot;
    if (!snapshot.segmentHash) {
      console.log('PROBLEM !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', snapshot);
      return SyncObjectStatus.SERVER_ERROR;
    }
    await new SyncObjectCommand(this.obj, snapshot.segmentHash, this.progress).execute();
    return SyncObjectStatus.SERVER_ERROR;
    // await this.syncSegment(snapshot.segmentHash);
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
