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
import { SyncMode, SyncProgress } from '../../../../common/model/sync.model';
import { TokenStorageGetCommand } from '../../../../common/command/server/token/token-storage-get.command';
import { TokenDecodeCommand } from '../../../../common/command/server/token/token-decode.command';

export class SyncGetProgressCommand implements ICommand<Promise<SyncProgress | undefined>> {
  constructor(private sub: string) {}
  async execute(): Promise<SyncProgress | undefined> {
    const token = await new TokenStorageGetCommand().execute();
    if (!token) return;
    const accessToken = new TokenDecodeCommand(token?.access_token).execute();

    // check sub so we can ge
    if (this.sub !== accessToken.sub) {
      return { timestamp: -1, id: -1, serverId: -1, mode: SyncMode.RESET, sub: accessToken.sub };
    }

    const sync = await BrowserStorage.get<SyncProgress | undefined>(ObjectStoreKeys.SYNC_PROGRESS);
    if (sync) return sync;

    const obj = await SyncGetProgressCommand.getFirstObject();
    if (!obj) return { timestamp: -1, id: -1, serverId: -1, mode: SyncMode.OFF, sub: accessToken.sub };
    return { timestamp: obj.createdAt, id: obj.id, serverId: -1, mode: SyncMode.OFF, sub: accessToken.sub };
  }

  static async getFirstObject(): Promise<ObjDto | undefined> {
    let id = undefined;
    let i = 1;
    // find first not empty list
    while (!id) {
      const key = `${ObjectStoreKeys.OBJECT_LIST}:${i}`;
      const list = await BrowserStorage.get<number[]>(key);
      if (!list) return undefined;
      id = list.shift();
      i++;
    }
    // get object timestamp
    return await new ObjGetCommand(id).execute();
  }
}
