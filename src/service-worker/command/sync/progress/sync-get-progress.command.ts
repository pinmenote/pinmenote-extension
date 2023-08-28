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
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjGetCommand } from '../../../../common/command/obj/obj-get.command';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { SyncProgress } from '../sync.model';

export class SyncGetProgressCommand implements ICommand<Promise<SyncProgress>> {
  async execute(): Promise<SyncProgress> {
    const sync = await BrowserStorage.get<SyncProgress | undefined>(ObjectStoreKeys.SYNC_PROGRESS);
    if (!sync) {
      const obj = await this.getFirstObject();
      return { state: 'update', timestamp: obj.createdAt, id: obj.id };
    }
    return sync;
  }

  async getFirstObject(): Promise<ObjDto> {
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
    return obj;
  }
}
