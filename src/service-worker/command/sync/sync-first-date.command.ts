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
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';

export class SyncFirstDateCommand implements ICommand<Promise<number>> {
  async execute(): Promise<number> {
    let id = undefined;
    let i = 1;
    // find first not empty list
    while (!id) {
      const key = `${ObjectStoreKeys.OBJECT_LIST}:${i}`;
      const list = await BrowserStorage.get<number[]>(key);
      id = list.shift();
      i++;
    }
    // get object timestamp
    const obj = await new ObjGetCommand(id).execute();
    return obj.createdAt;
  }
}
