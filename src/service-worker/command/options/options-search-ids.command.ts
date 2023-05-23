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
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { distance } from 'fastest-levenshtein';

interface DistanceWord {
  word: string;
  distance: number;
}

interface DistanceIds {
  ids: number[];
  distance: number;
}

export class OptionsSearchIdsCommand implements ICommand<Promise<number[]>> {
  constructor(private search: string, private from: number, private limit: number) {}
  async execute(): Promise<number[]> {
    const searchWords = this.search.split(' ');

    const wordsIds: DistanceIds[] = [];
    for (const search of searchWords) {
      const s = await this.getWordSet(search);
      if (s) wordsIds.push(...s);
    }
    wordsIds.sort((a, b) => {
      if (a.distance > b.distance) {
        return 1;
      } else if (a.distance < b.distance) {
        return -1;
      }
      return 0;
    });

    const idsSet = new Set<number>();
    for (const obj of wordsIds) {
      obj.ids.forEach((id) => idsSet.add(id));
    }

    const out: number[] = [];
    let skip = true;
    for (const objId of Array.from(idsSet)) {
      // dirty but works - assume that javascript set preserves order
      if (this.from > -1 && skip && objId !== this.from) {
        continue;
      } else if (objId === this.from) {
        skip = false;
      }
      out.push(objId);
      if (out.length >= this.limit) break;
    }
    return out;
  }

  async getWordSet(search: string): Promise<DistanceIds[] | undefined> {
    const start = search.substring(0, 2);
    const key = `${ObjectStoreKeys.SEARCH_WORD}:${start}`;
    const words = await BrowserStorageWrapper.get<string[] | undefined>(key);
    if (!words) return;

    const distanceWord: DistanceWord[] = [];

    for (const word of words) {
      distanceWord.push({ word, distance: distance(search, word) });
    }
    distanceWord.sort((a, b) => {
      if (a.distance > b.distance) {
        return 1;
      } else if (a.distance < b.distance) {
        return -1;
      }
      return 0;
    });

    const distances: DistanceIds[] = [];

    for (const dw of distanceWord) {
      const wordKey = `${ObjectStoreKeys.SEARCH_INDEX}:${dw.word}`;
      if (dw.distance > 3) continue;
      const ids = await BrowserStorageWrapper.get<number[] | undefined>(wordKey);
      if (!ids) continue;
      distances.push({ distance: dw.distance, ids });
    }
    return distances;
  }
}
