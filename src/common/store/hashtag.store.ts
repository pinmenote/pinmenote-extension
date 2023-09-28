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
import { ObjectStoreKeys } from '../keys/object.store.keys';
import { fnConsoleLog } from '../fn/fn-console';
import { BrowserStorage } from '@pinmenote/browser-api';

const HASHTAG_REGEX = new RegExp(/#(\w+)/g);

export class HashtagStore {
  static removeTags = async (words: string[], id: number) => {
    for (const word of words) {
      await this.removeTag(word, id);
    }
  };

  static saveTag = async (word: string, id: number) => {
    const key = `${ObjectStoreKeys.TAG_INDEX}:${word}`;
    let arr = await BrowserStorage.get<number[] | undefined>(key);
    if (arr && arr.indexOf(id) !== -1) return;

    if (arr) {
      arr.push(id);
    } else {
      arr = [id];
    }
    await BrowserStorage.set<number[]>(key, arr);
    await this.saveWord(word);
  };

  static removeTag = async (word: string, id: number) => {
    const key = `${ObjectStoreKeys.TAG_INDEX}:${word}`;
    const arr = await BrowserStorage.get<number[] | undefined>(key);

    if (!arr) return;
    const index = arr.indexOf(id);
    if (index === -1) return;

    arr.splice(index, 1);
    await this.removeWord(word);
    if (arr.length === 0) {
      await BrowserStorage.remove(key);
      return;
    }
    await BrowserStorage.set<number[]>(key, arr);
  };

  private static saveWord = async (word: string) => {
    let arr = await BrowserStorage.get<string[] | undefined>(ObjectStoreKeys.TAG_WORD);
    if (arr && arr.indexOf(word) !== -1) return;
    if (arr) {
      arr.push(word);
    } else {
      arr = [word];
    }
    fnConsoleLog('Save word', arr);
    await BrowserStorage.set<string[]>(ObjectStoreKeys.TAG_WORD, arr.sort());
  };

  private static removeWord = async (word: string) => {
    const arr = await BrowserStorage.get<string[] | undefined>(ObjectStoreKeys.TAG_WORD);
    if (!arr) return;

    const index = arr.indexOf(word);
    if (index === -1) return;

    arr.splice(index, 1);
    fnConsoleLog('Remove word', arr);
    await BrowserStorage.set<string[]>(ObjectStoreKeys.TAG_WORD, arr);
  };
}
