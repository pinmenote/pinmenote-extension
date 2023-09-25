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

export class PageSegmentAddRefCommand implements ICommand<Promise<boolean>> {
  constructor(private hash: string) {}

  async execute(): Promise<boolean> {
    const key = `${ObjectStoreKeys.CONTENT_HASH}:${this.hash}`;
    const has = await BrowserStorage.get(key);
    if (!has) return false;
    await this.incrementCount();
    return true;
  }

  async incrementCount(): Promise<void> {
    const key = `${ObjectStoreKeys.CONTENT_HASH_COUNT}:${this.hash}`;
    let count = (await BrowserStorage.get<number | undefined>(key)) || 0;
    count++;
    await BrowserStorage.set(key, count);
  }
}
