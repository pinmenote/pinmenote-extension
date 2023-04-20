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
    let ch = '';
    let flatPart = '';
    for (const word of words) {
      for (let i = 0; i < word.length; i++) {
        ch = word.charAt(i).toLowerCase();
        flatPart += ch;
        if (flatPart.length % 2 === 0) {
          await this.saveStorage(flatPart, id);
        }
      }
      await this.saveStorage(flatPart, id);
      flatPart = '';
    }
    fnConsoleLog('indexed', Array.from(this.flatSet), 'count', this.flatSet.size, 'in', Date.now() - a);
  };

  private static saveStorage = async (value: string, id: number) => {
    // skip existing
    if (this.flatSet.has(value)) return;

    const key = `${ObjectStoreKeys.SEARCH_INDEX}:${value}`;
    let arr = await BrowserStorageWrapper.get<number[]>(key);
    if (arr) {
      arr.push(id);
    } else {
      arr = [id];
    }
    await BrowserStorageWrapper.set<number[]>(key, arr);
    this.flatSet.add(value);
  };
}
