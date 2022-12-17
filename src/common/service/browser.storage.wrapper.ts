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
import { fnBrowserApi } from './browser.api.wrapper';

export class BrowserStorageWrapper {
  private static get api(): chrome.storage.LocalStorageArea | browser.storage.StorageArea {
    return fnBrowserApi().storage.local;
  }

  static async get<T>(key: string): Promise<T> {
    const value = await this.api.get(key);
    return value[key];
  }

  static async getAll(): Promise<any> {
    return await this.api.get();
  }

  static async getBytesInUse(key?: string): Promise<number> {
    return await this.api.getBytesInUse(key);
  }

  static async set<T>(key: string, value: T): Promise<void> {
    const v: { [key: string]: any } = {};
    v[key] = value;
    await this.api.set(v);
  }

  static async remove(key: string): Promise<void> {
    await this.api.remove(key);
  }

  static async clear(): Promise<void> {
    await this.api.clear();
  }
}
