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
import { PinHashtagStore } from '../../store/pin-hashtag.store';
import { PinUpdateObject } from '../../model/pin.model';
import { fnConsoleLog } from '../../fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class PinUpdateCommand implements ICommand<void> {
  constructor(private data: PinUpdateObject) {}
  async execute(): Promise<void> {
    fnConsoleLog('WorkerPinManager->pinUpdate', this.data, this.data.pin.id);
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.data.pin.id}`;

    const updateTags = this.shouldUpdateTags(this.data.newHashtag, this.data.oldHashtag);

    if (updateTags) await this.clearCurrentHashtags();

    await BrowserStorageWrapper.set(key, this.data.pin);

    if (updateTags) await this.addNewHashtags();
  }

  private shouldUpdateTags(a?: string[], b?: string[]): boolean {
    if (a === b) return false;
    if (a == undefined && b == undefined) return false;
    if (a == undefined || b == undefined) return true;
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return true;
    }
    return false;
  }

  private async addNewHashtags(): Promise<void> {
    if (!this.data.newHashtag) return;
    const hashtags = this.data.newHashtag;
    for (const tag of hashtags) {
      await PinHashtagStore.addHashtag(tag, this.data.pin.id);
    }
  }

  private async clearCurrentHashtags(): Promise<void> {
    if (!this.data.oldHashtag) return;
    const hashtags = this.data.oldHashtag;
    for (const tag of hashtags) {
      await PinHashtagStore.delHashtag(tag, this.data.pin.id);
    }
  }
}
