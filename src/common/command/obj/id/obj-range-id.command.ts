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
import { ICommand } from '../../../model/shared/common.dto';
import { ObjIdRangeResponse } from '../../../model/obj-request.model';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnConsoleLog } from '../../../fn/fn-console';

export class ObjRangeIdCommand implements ICommand<Promise<ObjIdRangeResponse>> {
  constructor(private listId: number, private from: number, private limit: number, private reverse = false) {}
  async execute(): Promise<ObjIdRangeResponse> {
    let listId = this.listId;
    const ids = await this.getIds(listId, this.from, this.limit);

    // Add more
    while (ids.length < this.limit && listId > 1) {
      listId -= 1;
      fnConsoleLog('Add more', listId);
      const add = await this.getIds(listId, ids[ids.length - 1], this.limit - ids.length);
      ids.push(...add);
    }

    fnConsoleLog('ObjRangeIdCommand->execute', listId, this.from, this.limit, ids);

    return {
      ids,
      listId
    };
  }

  private getIds = async (listId: number, from: number, limit: number): Promise<number[]> => {
    let ids = await this.getList(listId);

    if (this.reverse) ids = ids.reverse();

    let index = ids.indexOf(from);
    // fnConsoleLog('ObjRangeIdCommand->getIds', 'index', index, 'from', from, 'ids', ids);

    if (index === -1) index = 0;

    return ids.slice(index, index + limit);
  };

  private async getList(listId: number): Promise<number[]> {
    const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }
}
