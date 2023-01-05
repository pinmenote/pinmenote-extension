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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinObject } from '../../../common/model/pin.model';
import { PinUpdateCommand } from '../pin/pin-update.command';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class OptionsPinUpdateCommand implements ICommand<void> {
  constructor(private data: PinObject) {}
  async execute(): Promise<void> {
    try {
      await new PinUpdateCommand({ pin: this.data }).execute();
      await this.addChangedPin();
      await BrowserApi.sendRuntimeMessage<PinObject>({ type: BusMessageType.OPTIONS_PIN_UPDATE, data: this.data });
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }
  private async addChangedPin(): Promise<void> {
    let data = await BrowserStorageWrapper.get<number[]>(ObjectStoreKeys.PIN_CHANGE);
    if (data) {
      data.push(this.data.id);
    } else {
      data = [this.data.id];
    }
    await BrowserStorageWrapper.set(ObjectStoreKeys.PIN_CHANGE, data);
  }
}
