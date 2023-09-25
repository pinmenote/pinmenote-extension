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
import { ICommand, ServerErrorDto } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { ApiObjAddCommand, ObjAddResponse } from '../../api/store/obj/api-obj-add.command';
import { BeginTxResponse, ObjSingleChange } from '../../api/store/api-store.model';
import { ApiErrorCode } from '../../../../common/model/shared/api.error-code';
import { ApiObjGetByHashCommand } from '../../api/store/obj/api-obj-get-by-hash.command';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { fnSleep } from '../../../../common/fn/fn-sleep';

export class SyncObjectCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto, private hash: string, private tx: BeginTxResponse) {}

  async execute(): Promise<void> {
    if (this.obj.server?.id) return;
    const resp: ObjAddResponse | ServerErrorDto = await new ApiObjAddCommand(this.obj, this.hash, this.tx).execute();
    if ('serverId' in resp) {
      return await this.saveServerId(resp.serverId);
    } else if ('code' in resp && resp.code === ApiErrorCode.SYNC_DUPLICATED_HASH) {
      return await this.setByHash();
    }
    fnConsoleLog('SyncObjectCommand', 'tx', this.tx, 'resp', resp);
    throw new Error('PROBLEM !!!!!!!!!!!!!!!');
  }

  private async setByHash(): Promise<void> {
    const resp: ObjSingleChange | ServerErrorDto = await new ApiObjGetByHashCommand(this.hash, this.tx).execute();
    if ('serverId' in resp) {
      await this.saveServerId(resp.serverId);
      return;
    }
    fnConsoleLog('SyncObjectCommand->setByHash');
    throw new Error('PROBLEM !!!!!!!!!!!!!!!');
  }
  private async saveServerId(serverId: number): Promise<void> {
    this.obj.server = { id: serverId };
    await BrowserStorage.set(`${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`, this.obj);
    await BrowserStorage.set(`${ObjectStoreKeys.SERVER_ID}:${serverId}`, this.obj.id);
    await fnSleep(500);
    fnConsoleLog('SyncObjectCommand->saveServerId', serverId, 'obj->id', this.obj.id);
  }
}
