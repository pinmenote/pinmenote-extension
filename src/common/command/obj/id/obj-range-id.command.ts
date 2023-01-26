/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ObjIdRangeResponse } from '../../../model/obj-request.model';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;
import { fnConsoleLog } from '../../../fn/console.fn';

export class ObjRangeIdCommand implements ICommand<Promise<ObjIdRangeResponse>> {
  constructor(private listId: number, private from: number, private limit: number, private reverse = false) {}
  async execute(): Promise<ObjIdRangeResponse> {
    const lastId = await this.getLastId();
    if (this.from > lastId) {
      this.from = lastId;
    }
    const data = await this.findFromList(this.listId);
    if (this.reverse) {
      const ids = data.ids.reverse().slice(data.ids.indexOf(this.from), this.limit);
      fnConsoleLog('ObjRangeIdCommand->execute', this.listId, this.from, this.limit, ids);
      return {
        ids,
        listId: data.listId
      };
    }
    const ids = data.ids.slice(data.ids.indexOf(this.from), this.limit);
    fnConsoleLog('ObjRangeIdCommand->execute', this.listId, this.from, this.limit, ids);
    return {
      ids,
      listId: data.listId
    };
  }

  private async findFromList(listId: number): Promise<ObjIdRangeResponse> {
    const ids = await this.getList(listId);
    if (!ids.includes(this.from) && listId > 1) {
      return this.findFromList(listId - 1);
    }
    return { listId, ids };
  }

  private async getLastId(): Promise<number> {
    return (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_ID)) || 1;
  }

  private async getList(listId: number): Promise<number[]> {
    const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }
}
