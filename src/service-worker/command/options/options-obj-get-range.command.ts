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
import { ObjRangeRequest, ObjRangeResponse } from 'src/common/model/obj-request.model';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjRangeIdCommand } from '../../../common/command/obj/id/obj-range-id.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { OptionsSearchIdsCommand } from './options-search-ids.command';
import { fnConsoleLog } from '../../../common/fn/console.fn';

const emptyResult = { listId: -1, data: [] };

export class OptionsObjGetRangeCommand implements ICommand<Promise<ObjRangeResponse | undefined>> {
  constructor(private data: ObjRangeRequest) {}

  async execute(): Promise<ObjRangeResponse | undefined> {
    try {
      const { from, search, limit } = this.data;
      let listId = this.data.listId;
      if (search) {
        return await this.getSearch(from, limit, search);
      }
      if (listId === -1) {
        listId = (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_LIST_ID)) || 1;
      }
      return await this.getRange(from, listId, limit);
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private async getSearch(from: number, limit: number, search: string): Promise<ObjRangeResponse> {
    if (search.length < 2) return emptyResult;

    const ids = await new OptionsSearchIdsCommand(search, from, limit).execute();

    const data: ObjDto[] = [];
    for (const objId of ids) {
      const objKey = `${ObjectStoreKeys.OBJECT_ID}:${objId}`;
      const obj = await BrowserStorageWrapper.get<ObjDto>(objKey);
      if (!obj) {
        fnConsoleLog('Empty object !!!!!!!!!!!', objId);
        continue;
      }
      data.push(obj);
    }

    return { listId: -1, data };
  }

  private async getRange(from: number, listId: number, limit: number): Promise<ObjRangeResponse> {
    const out = [];
    const data = await new ObjRangeIdCommand(listId, from, limit, true).execute();

    for (let i = 0; i < data.ids.length; i++) {
      const key = `${ObjectStoreKeys.OBJECT_ID}:${data.ids[i]}`;
      const obj = await BrowserStorageWrapper.get<ObjDto>(key);
      out.push(obj);
    }
    return {
      listId: data.listId,
      data: out
    };
  }
}
