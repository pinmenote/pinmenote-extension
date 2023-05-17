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
import { ObjServerDto, ObjStatusDto, ObjSyncStatusDto } from '../../../../common/model/obj/obj-server.dto';
import { ApiStoreAddObjectCommand } from '../../api/store/api-store-add-object.command';
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjUpdateIndexDelCommand } from '../../../../common/command/obj/date-index/obj-update-index-del.command';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { SyncGatherChangesCommand } from './sync-gather-changes.command';
import { SyncSendChangesCommand } from './sync-send-changes.command';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

export class SyncUpdateObjectCommand implements ICommand<Promise<boolean>> {
  constructor(private id: number, private dt: Date) {}
  async execute(): Promise<boolean> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.id}`;
    const obj = await BrowserStorageWrapper.get<ObjDto>(key);

    // some error when you update object then you remove it - remove from index cause no object found
    if (!obj) {
      await new ObjUpdateIndexDelCommand(this.id, this.dt).execute();
      return false;
    }

    // Gather data to sync
    if (!obj.server) {
      obj.server = await this.assignServerId(obj);
      await BrowserStorageWrapper.set<ObjDto>(key, obj);
    }

    // got some error so return false
    if (!obj.server) return false;

    // skip object that is already updated
    if (obj.server.status === ObjSyncStatusDto.OK) {
      return true;
    }

    // trying to gather changes
    if (obj.server.status === ObjSyncStatusDto.GATHER) {
      obj.server.changes = await new SyncGatherChangesCommand(obj).execute();
      obj.server.status = ObjSyncStatusDto.UPLOAD;
      await BrowserStorageWrapper.set<ObjDto>(key, obj);
    }

    // trying to upload changes
    if (obj.server.status === ObjSyncStatusDto.UPLOAD) {
      await new SyncSendChangesCommand(obj).execute();
      obj.server.status = ObjSyncStatusDto.OK;
      await BrowserStorageWrapper.set<ObjDto>(key, obj);
    }

    return true;
  }

  private assignServerId = async (obj: any): Promise<ObjServerDto | undefined> => {
    // copy data
    const data = obj.data;
    const local = obj.local;
    // temporary remove data from obj
    delete obj['data'];
    delete obj['local'];

    const req = await new ApiStoreAddObjectCommand(obj).execute();

    // bring back data
    obj.data = data;
    obj.local = local;

    if (!req) return;
    const res = req.res;
    if (req.status !== 201 && res.result !== ObjStatusDto.OK) {
      fnConsoleLog('SyncUpdateObjectCommand->resp', req, this.id, obj);
      return;
    }

    return { id: res.serverId, changes: [], status: ObjSyncStatusDto.GATHER };
  };
}
