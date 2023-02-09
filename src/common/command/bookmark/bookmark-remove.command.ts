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
import { ObjBookmarkDto } from '../../model/obj-bookmark.model';
import { ObjDto } from '../../model/obj.model';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;

export class BookmarkRemoveCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto<ObjBookmarkDto>) {}

  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;
    await BrowserStorageWrapper.remove(key);

    const bookmarkKey = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.obj.data.url.href}`;
    await BrowserStorageWrapper.remove(bookmarkKey);

    await this.removeBookmarkFromList(this.obj.id);

    await new ObjRemoveIdCommand(this.obj.id).execute();
  }

  private async removeBookmarkFromList(id: number): Promise<void> {
    const bookmarkList = (await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.BOOKMARK_LIST)) || [];
    await BrowserStorageWrapper.set(
      ObjectStoreKeys.BOOKMARK_LIST,
      bookmarkList.filter((u) => u !== id)
    );
  }
}
