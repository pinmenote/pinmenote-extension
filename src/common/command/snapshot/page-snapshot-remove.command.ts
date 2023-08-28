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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjIndexOp } from '../../model/obj-index.model';
import { ObjPageDto } from '../../model/obj/obj-page.dto';
import { ObjRemoveHashtagsCommand } from '../obj/hashtag/obj-remove-hashtags.command';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjUpdateIndexAddCommand } from '../obj/date-index/obj-update-index-add.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { PageSegmentGetCommand } from './segment/page-segment-get.command';
import { PageSegmentRemoveListCommand } from './segment/page-segment-remove-list.command';
import { SegmentPage } from '@pinmenote/page-compute';
import { WordIndex } from '../../text/word.index';
import { fnConsoleLog } from '../../fn/fn-console';

export class PageSnapshotRemoveCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto<ObjPageDto>) {}

  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;
    await BrowserStorage.remove(key);

    await new ObjRemoveIdCommand(this.obj.id, ObjectStoreKeys.OBJECT_LIST).execute();

    const { snapshot } = this.obj.data;

    await LinkHrefStore.del(snapshot.info.url, this.obj.id);

    if (snapshot.segmentHash) await this.removeSnapshot(snapshot.segmentHash);

    await WordIndex.removeFlat(this.obj.data.snapshot.info.words, this.obj.id);

    await new ObjRemoveHashtagsCommand(this.obj.id, snapshot.info.hashtags).execute();
  }

  private removeSnapshot = async (segmentHash: string) => {
    const segment = await new PageSegmentGetCommand<SegmentPage>(segmentHash).execute();
    if (!segment) {
      fnConsoleLog('PageSnapshotRemoveCommand->removeSnapshot->empty', segmentHash);
      return;
    }
    const ref: string[] = [];

    // Remove hashed content
    const assetRefs = await new PageSegmentRemoveListCommand(segment.content.assets).execute();
    ref.push(...assetRefs);
    const cssRefs = await new PageSegmentRemoveListCommand(segment.content.css).execute();
    ref.push(...cssRefs);

    // remove snapshot
    await new PageSegmentRemoveListCommand([segmentHash]).execute();
    await new ObjUpdateIndexAddCommand({
      id: this.obj.id,
      dt: this.obj.updatedAt,
      op: ObjIndexOp.DELETE,
      data: {
        hash: segmentHash,
        ref
      }
    }).execute();
  };
}
