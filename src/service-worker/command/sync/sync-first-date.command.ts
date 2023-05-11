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
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';

export class SyncFirstDateCommand implements ICommand<Promise<number>> {
  async execute(): Promise<number> {
    let id = undefined;
    let i = 1;
    // find first not empty list
    while (!id) {
      const key = `${ObjectStoreKeys.OBJECT_LIST}:${i}`;
      const list = await BrowserStorageWrapper.get<number[]>(key);
      id = list.shift();
      i++;
    }
    // get object timestamp
    const obj = await BrowserStorageWrapper.get<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${id}`);
    return obj.createdAt;
  }
}