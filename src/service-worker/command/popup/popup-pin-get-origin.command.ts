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
import { PinHrefOriginStore } from '../../store/pin/pin-href-origin.store';
import { PinObject } from '../../../common/model/pin.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;
import PinUrl = Pinmenote.Pin.PinUrl;

export class PopupPinGetOriginCommand implements ICommand<void> {
  constructor(private data?: PinUrl) {}

  async execute(): Promise<void> {
    try {
      if (!this.data) return;
      const data = await this.pinGetOrigin(this.data, true);
      await BrowserApi.sendRuntimeMessage<PinObject[]>({
        type: BusMessageType.POPUP_PIN_GET_ORIGIN,
        data
      });
    } catch (e) {
      fnConsoleLog('Error', e);
    }
  }

  private async pinGetOrigin(data: PinUrl, filterHref = false): Promise<PinObject[]> {
    fnConsoleLog('WorkerPinManager->pinGetOrigin', data);
    const pinIds = (await PinHrefOriginStore.originIds(data.origin)).reverse();
    const out: PinObject[] = [];
    for (const id of pinIds) {
      const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;
      const pin = await BrowserStorageWrapper.get<PinObject>(key);
      if (filterHref && pin.url.href === data.href) continue;
      out.push(pin);
    }
    return out;
  }
}
