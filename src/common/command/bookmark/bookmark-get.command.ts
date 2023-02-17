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
import { ObjDto, ObjUrlDto } from '../../model/obj.model';
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ICommand } from '../../model/shared/common.model';
import { ObjBookmarkDto } from '../../model/obj-bookmark.model';
import { ObjectStoreKeys } from '../../keys/object.store.keys';

export class BookmarkGetCommand implements ICommand<Promise<ObjDto<ObjBookmarkDto> | undefined>> {
  constructor(private url: ObjUrlDto) {}
  async execute(): Promise<ObjDto<ObjBookmarkDto> | undefined> {
    const bookmarkKey = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.url.href}`;

    const id = await BrowserStorageWrapper.get<number | undefined>(bookmarkKey);
    if (!id) return undefined;

    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;

    return await BrowserStorageWrapper.get<ObjDto<ObjBookmarkDto> | undefined>(key);
  }
}
