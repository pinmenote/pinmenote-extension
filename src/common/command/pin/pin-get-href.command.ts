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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { PinHrefOriginStore } from '../../store/pin-href-origin.store';
import { PinObject } from '../../model/pin.model';
import { fnConsoleLog } from '../../fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;
import PinUrl = Pinmenote.Pin.PinUrl;

export class PinGetHrefCommand implements ICommand<Promise<PinObject[]>> {
  constructor(private data: PinUrl, private filterVisible = false) {}

  async execute(): Promise<PinObject[]> {
    const pinIds = (await PinHrefOriginStore.hrefIds(this.data.href)).reverse();
    fnConsoleLog('WorkerPinManager->pinGetHref', this.data.href, pinIds);
    // await this.test();
    const out: PinObject[] = [];
    for (const id of pinIds) {
      const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;
      const pin = await BrowserStorageWrapper.get<PinObject>(key);
      // TODO revisit visible flag in pin.manager.ts in content scripts
      if (this.filterVisible && !pin.visible) continue;
      out.push(pin);
    }
    return out;
  }
}
