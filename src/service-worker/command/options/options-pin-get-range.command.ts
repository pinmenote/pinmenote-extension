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
import { PinObject, PinRangeRequest } from '@common/model/pin.model';
import { BrowserStorageWrapper } from '@common/service/browser.storage.wrapper';
import { BusMessageType } from '@common/model/bus.model';
import { ObjectStoreKeys } from '../../store/keys/object.store.keys';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendRuntimeMessage } from '@common/message/runtime.message';
import ICommand = Pinmenote.Common.ICommand;

export class OptionsPinGetRangeCommand implements ICommand<void> {
  constructor(private data: PinRangeRequest) {}

  async execute(): Promise<void> {
    try {
      const data = await this.getRange(ObjectStoreKeys.OBJECT_ID, this.data);
      await sendRuntimeMessage<PinObject[]>({ type: BusMessageType.OPTIONS_PIN_GET_RANGE, data });
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private async getRange(idKey: string, range: PinRangeRequest): Promise<PinObject[]> {
    if (range.from === undefined || !range.limit) return [];
    // Get ids - can optimise reverse by looking in reverse later
    const ids = (await this.getIds()).reverse();

    // Get ids
    const out: PinObject[] = [];
    const getIds: number[] = ids.slice(range.from, range.from + range.limit);
    for (let i = 0; i < getIds.length; i++) {
      const key = `${idKey}:${getIds[i]}`;
      const pin = await BrowserStorageWrapper.get<PinObject>(key);
      out.push(pin);
    }
    return out;
  }

  private async getIds(): Promise<number[]> {
    const value = await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.OBJECT_ID_LIST);
    return value || [];
  }
}
