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
import { ObjDateIndex } from '../../../../common/command/obj/index/obj-update-index-add.command';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { PageSegmentGetCommand } from '../../../../common/command/snapshot/segment/page-segment-get.command';
import { SyncObjectDataCommand } from './sync-object-data.command';
import { SyncProgress } from '../sync.model';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

export class SyncSnapshotCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto<ObjPageDto>, private progress: SyncProgress, private index: ObjDateIndex) {}
  async execute(): Promise<void> {
    const snapshot = this.obj.data.snapshot;
    // fnConsoleLog('SyncSnapshotCommand->comments', this.obj.data.comments);
    // fnConsoleLog('SyncSnapshotCommand->snapshot', this.obj.id, 'index', this.index, 'obj', this.obj);
    if (!snapshot.segmentHash) return;

    await new SyncObjectDataCommand(this.obj, snapshot.segmentHash, this.progress, this.index).execute();

    await this.syncSegment(snapshot.segmentHash);
  }

  private async syncSegment(hash: string, nested = false) {
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
        const matched = content.html.html.matchAll(/(data-pin-hash=")([a-z\d]+")/g);
        const a = Array.from(matched);
        // if (content.assets.length > 0) fnConsoleLog('IFRAME', a, content);
        if (a.length > 0) fnConsoleLog('IFRAME', nested, content, 'MATCHED', a);
        for (const css of content.css) {
          await this.syncSegment(css);
        }
        for (const asset of content.assets) {
          await this.syncSegment(asset, true);
        }
        break;
      }
    }
  }
}
