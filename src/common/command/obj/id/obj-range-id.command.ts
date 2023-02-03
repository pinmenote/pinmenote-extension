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
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ObjIdRangeResponse } from '../../../model/obj-request.model';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;
import { fnConsoleLog } from '../../../fn/console.fn';

export class ObjRangeIdCommand implements ICommand<Promise<ObjIdRangeResponse>> {
  constructor(private listId: number, private from: number, private limit: number, private reverse = false) {}
  async execute(): Promise<ObjIdRangeResponse> {
    let listId = this.listId;
    let ids = await this.getList(this.listId);
    if (this.reverse) {
      ids = ids.reverse();
    }
    let index = ids.indexOf(this.from);
    if (index === -1) index = 0;
    ids = ids.slice(index, this.limit);
    if (ids.length < this.limit && listId > 1) listId -= 1;
    fnConsoleLog('ObjRangeIdCommand->execute', listId, this.from, this.limit, ids);
    return {
      ids,
      listId
    };
  }

  private async getList(listId: number): Promise<number[]> {
    const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }
}
