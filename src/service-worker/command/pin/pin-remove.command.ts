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
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinFindHashtagCommand } from './pin-find-hashtag.command';
import { PinHashtagStore } from '../../../common/store/pin-hashtag.store';
import { PinHrefOriginStore } from '../../../common/store/pin-href-origin.store';
import { PinObject } from '../../../common/model/pin.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class PinRemoveCommand implements ICommand<void> {
  constructor(private data: PinObject) {}
  async execute(): Promise<void> {
    fnConsoleLog('WorkerPinManager->pinRemove', this.data);
    await BrowserStorageWrapper.remove(`${ObjectStoreKeys.OBJECT_ID}:${this.data.id}`);
    await PinHrefOriginStore.delHrefOriginId(this.data.url, this.data.id);
    await this.delId(this.data.id);

    const hashtags = new PinFindHashtagCommand(this.data.value).execute();
    for (const tag of hashtags) {
      await PinHashtagStore.delHashtag(tag, this.data.id);
    }
  }

  private async delId(id: number): Promise<void> {
    const ids = await this.getIds();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] === id) {
        ids.splice(i, 1);
        await BrowserStorageWrapper.set(ObjectStoreKeys.PIN_ID_LIST, ids);
        return;
      }
    }
  }

  private async getIds(): Promise<number[]> {
    const value = await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.PIN_ID_LIST);
    return value || [];
  }
}
