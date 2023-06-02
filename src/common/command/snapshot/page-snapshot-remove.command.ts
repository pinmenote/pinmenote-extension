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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ContentSnapshotDto } from '../../model/obj/obj-content.dto';
import { ContentSnapshotGetCommand } from './content/content-snapshot-get.command';
import { ContentSnapshotRemoveListCommand } from './content/content-snapshot-remove-list.command';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjPageDto } from '../../model/obj/obj-page.dto';
import { ObjRemoveHashtagsCommand } from '../obj/hashtag/obj-remove-hashtags.command';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { WordIndex } from '../../text/index/word.index';
import { fnConsoleLog } from '../../fn/fn-console';

export class PageSnapshotRemoveCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto<ObjPageDto>) {}

  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;
    await BrowserStorageWrapper.remove(key);

    await new ObjRemoveIdCommand({ id: this.obj.id, dt: Date.now() }, this.obj.server?.id).execute();

    const { snapshot } = this.obj.data;

    await LinkHrefStore.del(snapshot.url, this.obj.id);

    if (snapshot.contentHash) await this.removeSnapshot(snapshot.contentHash);

    await WordIndex.removeFlat(this.obj.data.snapshot.words, this.obj.id);

    await new ObjRemoveHashtagsCommand(this.obj.id, snapshot.hashtags).execute();
  }

  private removeSnapshot = async (contentHash: string) => {
    const pageSnapshot = await new ContentSnapshotGetCommand<ContentSnapshotDto>(contentHash).execute();
    if (!pageSnapshot) {
      fnConsoleLog('PageSnapshotRemoveCommand->removeSnapshot->empty', contentHash);
      return;
    }
    // Remove hashed content
    await new ContentSnapshotRemoveListCommand(pageSnapshot.content.assets).execute();
    await new ContentSnapshotRemoveListCommand(pageSnapshot.content.css).execute();

    // remove snapshot
    await new ContentSnapshotRemoveListCommand([contentHash]).execute();
  };
}
