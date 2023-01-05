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
import { BusMessageType } from '../../../common/model/bus.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { sendRuntimeMessage } from '../../../common/message/runtime.message';

export class PinBoardStore {
  static pins: PinObject[] = [];

  private static loading = false;
  private static readonly search: PinRangeRequest = {
    from: 0,
    limit: 10
  };

  static removePin(value: PinObject) {
    for (let i = 0; i < this.pins.length; i++) {
      if (this.pins[i].id == value.id) {
        this.pins.splice(i, 1);
        break;
      }
    }
  }

  static clearSearch(): void {
    this.search.from = 0;
    this.search.search = undefined;
    this.pins = [];
  }

  static setLoading(value: boolean): void {
    this.loading = value;
  }

  static get isLoading(): boolean {
    return this.loading;
  }

  static timeout?: number;

  static setFrom(from: number): void {
    this.search.from = from;
  }

  static setSearch(search?: string): void {
    this.search.search = search;
  }

  static getSearch(): string | undefined {
    return this.search.search;
  }

  static getFrom(): number {
    return this.search.from;
  }

  static async sendRange(): Promise<void> {
    fnConsoleLog('PinBoardStore->getRange', this.search);
    await sendRuntimeMessage<PinRangeRequest>({
      type: BusMessageType.OPTIONS_PIN_GET_RANGE,
      data: this.search
    });
  }

  static async sendSearch(): Promise<void> {
    fnConsoleLog('PinBoardStore->getSearch', this.search);
    await sendRuntimeMessage<PinRangeRequest>({
      type: BusMessageType.OPTIONS_PIN_SEARCH,
      data: PinBoardStore.search
    });
  }
}
