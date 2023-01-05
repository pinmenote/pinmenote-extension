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
import { PinFindHashtagCommand } from './pin-find-hashtag.command';
import { PinHashtagStore } from '../../store/pin-hashtag.store';
import { PinHrefOriginStore } from '../../store/pin-href-origin.store';
import { PinObject } from '../../model/pin.model';
import { fnConsoleLog } from '../../fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class PinAddCommand implements ICommand<void> {
  constructor(private data: PinObject) {}
  async execute(): Promise<void> {
    fnConsoleLog('PinAddCommand->execute', this.data, this.data.id);

    await this.addId(this.data.id);

    const hashtags = new PinFindHashtagCommand(this.data.value).execute();
    for (const tag of hashtags) {
      await PinHashtagStore.addHashtag(tag, this.data.id);
    }

    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.data.id}`;
    await BrowserStorageWrapper.set(key, this.data);
    await PinHrefOriginStore.addHrefOriginId(this.data.url, this.data.id);
  }

  private async addId(id: number): Promise<void> {
    const ids = await this.getIds();
    ids.push(id);
    await BrowserStorageWrapper.set(ObjectStoreKeys.PIN_ID_LIST, ids);
    await BrowserStorageWrapper.set(ObjectStoreKeys.OBJECT_LAST_ID, id);
  }

  private async getIds(): Promise<number[]> {
    const value = await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.PIN_ID_LIST);
    return value || [];
  }
}
