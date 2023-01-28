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
import { PinRangeRequest, PinRangeResponse } from 'src/common/model/obj-request.model';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjDto } from '../../../common/model/obj.model';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { ObjRangeIdCommand } from '../../../common/command/obj/id/obj-range-id.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class OptionsPinGetRangeCommand implements ICommand<void> {
  constructor(private data: PinRangeRequest) {}

  async execute(): Promise<void> {
    try {
      const data = await this.getRange(ObjectStoreKeys.OBJECT_ID, this.data);
      await BrowserApi.sendRuntimeMessage<PinRangeResponse>({ type: BusMessageType.OPTIONS_PIN_GET_RANGE, data });
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private async getRange(idKey: string, range: PinRangeRequest): Promise<PinRangeResponse> {
    if (range.from === undefined || !range.limit) return { listId: range.listId || -1, data: [] };
    // Get ids - can optimise reverse by looking in reverse later
    if (!range.listId) range.listId = await this.getListId();
    const data = await new ObjRangeIdCommand(range.listId, range.from, range.limit, true).execute();
    const out = [];
    for (let i = 0; i < data.ids.length; i++) {
      const key = `${idKey}:${data.ids[i]}`;
      const obj = await BrowserStorageWrapper.get<ObjDto<ObjPagePinDto>>(key);
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
