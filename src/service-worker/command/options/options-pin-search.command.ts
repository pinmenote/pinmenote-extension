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
import { PinObject, PinRangeRequest } from '../../../common/model/pin.model';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class OptionsPinSearchCommand implements ICommand<void> {
  constructor(private data: PinRangeRequest) {}

  async execute(): Promise<void> {
    try {
      const data = await this.getSearch(ObjectStoreKeys.OBJECT_ID, this.data);
      await BrowserApi.sendRuntimeMessage<PinObject[]>({ type: BusMessageType.OPTIONS_PIN_SEARCH, data });
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private async getSearch(idKey: string, range: PinRangeRequest): Promise<PinObject[]> {
    if (!range.search || range.search?.length < 2) return [];
    const out: PinObject[] = [];
    const ids = (await this.getIds()).reverse();

    for (let i = 0; i < ids.length; i++) {
      // Skip those that were sent
      if (range.from && ids[i] >= range.from) continue;
      const key = `${idKey}:${ids[i]}`;
      const pin = await BrowserStorageWrapper.get<PinObject>(key);
      if (pin && this.search(range.search, pin)) {
        out.push(pin);
      }
      if (out.length > 5) {
        return out;
      }
    }
    return out;
  }

  private search(searchValue: string, pin: PinObject): boolean {
    if (pin.value.toLowerCase().indexOf(searchValue) > -1) return true;
    if (pin.url.href.indexOf(searchValue) > -1) return true;
    if (pin.createdAt.indexOf(searchValue) > -1) return true;
    if (pin.content.title.toLowerCase().indexOf(searchValue) > -1) return true;
    if (pin.content.elementText && pin.content.elementText.toLowerCase().indexOf(searchValue) > -1) return true;
    return false;
  }

  private async getIds(): Promise<number[]> {
    const value = await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.PIN_ID_LIST);
    return value || [];
  }
}
