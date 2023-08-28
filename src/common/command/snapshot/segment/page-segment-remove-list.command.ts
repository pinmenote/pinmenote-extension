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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnConsoleLog } from '../../../fn/fn-console';

export class PageSegmentRemoveListCommand implements ICommand<Promise<void>> {
  constructor(private hashList: string[]) {}

  async execute(): Promise<void> {
    for (const hash of this.hashList) {
      const key = `${ObjectStoreKeys.CONTENT_HASH}:${hash}`;

      const isLast = await this.decrementCount(hash);
      if (isLast) await BrowserStorage.remove(key);
    }
  }

  async decrementCount(hash: string): Promise<boolean> {
    const key = `${ObjectStoreKeys.CONTENT_HASH_COUNT}:${hash}`;
    let count = (await BrowserStorage.get<number | undefined>(key)) || 0;
    count--;
    fnConsoleLog('PageSegmentRemoveListCommand->decrementCount', count);
    if (count === 0) {
      await BrowserStorage.remove(key);
      return true;
    }
    await BrowserStorage.set<number>(key, count);
    return false;
  }
}
