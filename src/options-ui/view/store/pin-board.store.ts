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
import { PinObject, PinRangeRequest, PinRangeResponse } from '../../../common/model/pin.model';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinRemoveCommand } from '../../../common/command/pin/pin-remove.command';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class PinBoardStore {
  static pinData: PinObject[] = [];

  private static loading = false;
  private static isLastValue = false;
  private static readonly search: PinRangeRequest = {
    from: -1,
    limit: 10,
    listId: -1
  };

  static get pins(): PinObject[] {
    return this.pinData;
  }

  static setData(value: PinRangeResponse): void {
    const lastId = value.data[value.data.length - 1].id;
    if (this.search.from === lastId) {
      this.isLastValue = true;
      // Only one element so add it :/
      if (this.pinData.length === 0) {
        this.pinData.push(...value.data);
      }
    } else {
      this.search.listId = value.listId;
      this.search.from = lastId;
      this.pinData.push(...value.data);
    }
  }

  static removePin = async (value: PinObject): Promise<boolean> => {
    for (let i = 0; i < this.pinData.length; i++) {
      if (this.pinData[i].id == value.id) {
        this.pinData.splice(i, 1);
        await new PinRemoveCommand(value).execute();
        return true;
      }
    }
    return false;
  };

  static get isLast(): boolean {
    return this.isLastValue;
  }

  static async clearSearch(): Promise<void> {
    this.isLastValue = false;
    this.search.from = (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_ID)) || 1;
    this.search.search = undefined;
    this.search.listId = (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_LIST_ID)) || 1;
  }

  static setLoading(value: boolean): void {
    this.loading = value;
  }

  static get isLoading(): boolean {
    return this.loading;
  }

  static timeout?: number;

  static setSearch(search?: string): void {
    this.search.search = search;
  }

  static getSearch(): string | undefined {
    return this.search.search;
  }

  static async sendRange(): Promise<void> {
    fnConsoleLog('PinBoardStore->getRange', this.search);
    await BrowserApi.sendRuntimeMessage<PinRangeRequest>({
      type: BusMessageType.OPTIONS_PIN_GET_RANGE,
      data: this.search
    });
  }

  static async sendSearch(): Promise<void> {
    fnConsoleLog('PinBoardStore->getSearch', this.search);
    await BrowserApi.sendRuntimeMessage<PinRangeRequest>({
      type: BusMessageType.OPTIONS_PIN_SEARCH,
      data: PinBoardStore.search
    });
  }
}
