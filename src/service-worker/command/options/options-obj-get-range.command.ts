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
import { ObjDataDto, ObjDto } from '../../../common/model/obj.model';
import { ObjRangeRequest, ObjRangeResponse } from 'src/common/model/obj-request.model';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjRangeIdCommand } from '../../../common/command/obj/id/obj-range-id.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class OptionsObjGetRangeCommand implements ICommand<Promise<ObjRangeResponse | undefined>> {
  constructor(private data: ObjRangeRequest) {}

  async execute(): Promise<ObjRangeResponse | undefined> {
    try {
      const { from, listId, limit } = this.data;
      const response = await this.getRange(ObjectStoreKeys.OBJECT_ID, from, listId, limit);
      return response;
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private async getRange(idKey: string, from: number, listId: number, limit: number): Promise<ObjRangeResponse> {
    const out = [];
    const data = await new ObjRangeIdCommand(listId, from, limit, true).execute();

    for (let i = 0; i < data.ids.length; i++) {
      const key = `${idKey}:${data.ids[i]}`;
      const obj = await BrowserStorageWrapper.get<ObjDto<ObjDataDto>>(key);
      out.push(obj);
    }
    return {
      listId: data.listId,
      data: out
    };
  }

  private async getListId(): Promise<number> {
    const value = await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_LIST_ID);
    return value || 1;
  }
}
