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
import { fnConsoleLog } from '../fn/fn-console';

export class LinkOriginStore {
  static readonly NOTE_ORIGIN = 'note:origin';
  static readonly PIN_ORIGIN = 'pin:origin';
  static readonly OBJ_ORIGIN = 'obj:origin';

  private static ORIGIN_LIST = 'origin:list';

  static async add(keyPrefix: string, id: number, origin: string) {
    // Update origin
    const originIds = await this.originIds(keyPrefix, origin);
    originIds.push(id);
    await BrowserStorage.set(`${keyPrefix}:${origin}`, originIds);
    await this.addList(origin);
  }

  static async del(keyPrefix: string, id: number, origin: string) {
    // Update origin
    const originIds = await this.originIds(keyPrefix, origin);
    const newOrigin = originIds.filter((i) => i !== id);
    const key = `${keyPrefix}:${origin}`;
    if (newOrigin.length === 0) {
      await BrowserStorage.remove(key);
      await this.delList(origin);
    } else {
      await BrowserStorage.set(key, newOrigin);
    }
  }

  static async originIds(keyPrefix: string, url: string): Promise<number[]> {
    fnConsoleLog('LinkOriginStore->originIds', url);
    const key = `${keyPrefix}:${url}`;
    const value = await BrowserStorage.get<number[] | undefined>(key);
    return value || [];
  }

  static async originList(): Promise<string[]> {
    fnConsoleLog('LinkOriginStore->list');
    const value = await BrowserStorage.get<string[] | undefined>(this.ORIGIN_LIST);
    return value || [];
  }

  private static async addList(url: string): Promise<void> {
    const list = await this.originList();
    if (list.indexOf(url) === -1) {
      list.push(url);
      await BrowserStorage.set(this.ORIGIN_LIST, list);
    }
  }

  private static async delList(url: string): Promise<void> {
    const list = await this.originList();
    const index = list.indexOf(url);
    if (index > -1) {
      list.splice(index, 1);
      await BrowserStorage.set(this.ORIGIN_LIST, list);
    }
  }
}
