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
import { BrowserStorageWrapper } from '../service/browser.storage.wrapper';

export class ObjHashtagStore {
  private static OBJ_HASHTAG = 'obj:hashtag';
  private static OBJ_LIST_HASHTAG = 'obj:hashtag:list';

  static async addHashtag(hashtag: string, id: number): Promise<void> {
    const ids = await this.getHashtagIds(hashtag);
    if (ids.indexOf(id) === -1) {
      ids.push(id);
    }
    const key = `${this.OBJ_HASHTAG}:${hashtag}`;
    await BrowserStorageWrapper.set(key, ids);

    await this.addListHashtag(hashtag);
  }

  static async delHashtag(hashtag: string, id: number): Promise<void> {
    const ids = await this.getHashtagIds(hashtag);
    const key = `${this.OBJ_HASHTAG}:${hashtag}`;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] === id) {
        ids.splice(i, 1);
        break;
      }
    }
    if (ids.length === 0) {
      await BrowserStorageWrapper.remove(key);
      await this.delListHashtag(hashtag);
    } else {
      await BrowserStorageWrapper.set(key, ids);
    }
  }

  static async getHashtagList(): Promise<string[]> {
    const value = await BrowserStorageWrapper.get<string[] | undefined>(this.OBJ_LIST_HASHTAG);
    return value || [];
  }

  private static async getHashtagIds(hashtag: string): Promise<number[]> {
    const key = `${this.OBJ_HASHTAG}:${hashtag}`;
    return (await BrowserStorageWrapper.get<number[] | undefined>(key)) || [];
  }

  private static async addListHashtag(hashtag: string): Promise<void> {
    const set = new Set(await this.getHashtagList());
    set.add(hashtag);
    await this.setHashtagList(Array.from(set));
  }

  private static async delListHashtag(hashtag: string): Promise<void> {
    const s = new Set(await this.getHashtagList());
    s.delete(hashtag);
    await this.setHashtagList(Array.from(s));
  }

  private static async setHashtagList(list: string[]): Promise<void> {
    await BrowserStorageWrapper.set(this.OBJ_LIST_HASHTAG, list);
  }
}
