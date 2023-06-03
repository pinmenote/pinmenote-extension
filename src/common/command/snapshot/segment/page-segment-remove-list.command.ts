/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
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
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';

export class PageSegmentRemoveListCommand implements ICommand<Promise<void>> {
  constructor(private hashList: string[]) {}

  async execute(): Promise<void> {
    for (const hash of this.hashList) {
      const key = `${ObjectStoreKeys.CONTENT_HASH}:${hash}`;

      const isLast = await this.decrementCount(hash);
      if (isLast) await BrowserStorageWrapper.remove(key);
    }
  }

  async decrementCount(hash: string): Promise<boolean> {
    const key = `${ObjectStoreKeys.CONTENT_HASH_COUNT}:${hash}`;
    let count = (await BrowserStorageWrapper.get<number | undefined>(key)) || 0;
    count--;
    if (count === 0) {
      await BrowserStorageWrapper.remove(key);
      return true;
    }
    await BrowserStorageWrapper.set<number>(key, count);
    return false;
  }
}
