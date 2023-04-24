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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ConstraintsNlp } from './constraints.nlp';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/console.fn';

export class WordNlp {
  private static flatSet = new Set<string>();

  static toWordList(sentence: string): string[] {
    const words: string[] = [];
    let word = '';
    let key = '';
    for (let i = 0; i < sentence.length; i++) {
      key = sentence.charAt(i).toLowerCase();
      if (ConstraintsNlp.KEY_MAP[key]) key = ConstraintsNlp.KEY_MAP[key];
      if (ConstraintsNlp.PUNCT_CHARS.has(key)) {
        if (word.trim().length > 0) words.push(word.trim());
        word = '';
        continue;
      }
      word += key;
    }
    return words;
  }

  static indexFlat = async (words: string[], id: number): Promise<void> => {
    const a = Date.now();
    for (const word of words) {
      await this.saveStorage(word, id);
      await this.saveWord(word);
    }
    fnConsoleLog('indexed', Array.from(this.flatSet), 'count', this.flatSet.size, 'in', Date.now() - a);
    this.flatSet.clear();
  };

  static removeFlat = async (words: string[], id: number): Promise<void> => {
    const a = Date.now();
    for (const word of words) {
      await this.removeStorage(word, id);
    }
    fnConsoleLog('removed', Array.from(this.flatSet), 'count', this.flatSet.size, 'in', Date.now() - a);
  };

  private static removeStorage = async (value: string, id: number) => {
    if (this.flatSet.has(value)) return;
    this.flatSet.add(value);

    const key = `${ObjectStoreKeys.SEARCH_INDEX}:${value}`;
    const arr = await BrowserStorageWrapper.get<number[]>(key);
    if (!arr) return;

    const idx = arr.indexOf(id);
    if (idx === -1) return;

    arr.splice(idx, 1);
    if (arr.length === 0) {
      await BrowserStorageWrapper.remove(key);
      await this.removeWord(value);
    } else {
      await BrowserStorageWrapper.set<number[]>(key, arr);
    }
  };

  private static saveStorage = async (value: string, id: number) => {
    // skip existing
    if (this.flatSet.has(value)) return;
    this.flatSet.add(value);

    const key = `${ObjectStoreKeys.SEARCH_INDEX}:${value}`;
    let arr = await BrowserStorageWrapper.get<number[]>(key);
    if (arr) {
      arr.push(id);
    } else {
      arr = [id];
    }
    await BrowserStorageWrapper.set<number[]>(key, arr);
  };

  private static saveWord = async (word: string) => {
    if (word.length < 3) return;
    const start = word.substring(0, 2);
    const key = `${ObjectStoreKeys.SEARCH_WORD}:${start}`;
    let arr = await BrowserStorageWrapper.get<string[]>(key);
    if (arr) {
      const idx = arr.indexOf(word);
      if (idx === -1) arr.push(word);
    } else {
      arr = [word];
    }
    await BrowserStorageWrapper.set<string[]>(key, arr);
  };

  private static removeWord = async (word: string) => {
    const start = word.substring(0, 2);
    const key = `${ObjectStoreKeys.SEARCH_WORD}:${start}`;
    const arr = await BrowserStorageWrapper.get<string[]>(key);
    if (!arr) return;

    const idx = arr.indexOf(word);
    if (idx === -1) return;

    arr.splice(idx, 1);
    if (arr.length === 0) {
      await BrowserStorageWrapper.remove(key);
    } else {
      await BrowserStorageWrapper.set<string[]>(key, arr);
    }
  };
}
