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
import { ObjAddIdCommand } from '../obj/obj-add-id.command';
import { ObjNextIdCommand } from '../obj/obj-next-id.command';
import { ObjUrlDto } from '../../model/obj.model';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;
import BookmarkDto = Pinmenote.Bookmark.BookmarkDto;

export class BookmarkAddCommand implements ICommand<Promise<BookmarkDto>> {
  constructor(private value: string, private url: ObjUrlDto) {}

  async execute(): Promise<BookmarkDto> {
    const key = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.url.href}`;
    const id = await new ObjNextIdCommand().execute();

    const data: BookmarkDto = {
      id,
      value: this.value,
      url: this.url
    };
    await BrowserStorageWrapper.set(key, data);

    await this.addBookmarkToList(id);

    await new ObjAddIdCommand(id).execute();
    return data;
  }

  private async addBookmarkToList(id: number): Promise<void> {
    const bookmarkList = (await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.BOOKMARK_LIST)) || [];
    bookmarkList.push(id);
    await BrowserStorageWrapper.set(ObjectStoreKeys.BOOKMARK_LIST, bookmarkList);
  }
}
