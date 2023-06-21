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
import { ICommand } from '../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../common/keys/object.store.keys';
import { distance } from 'fastest-levenshtein';

interface DistanceWord {
  word: string;
  distance: number;
}

interface DistanceIds {
  word: string;
  ids: number[];
  distance: number;
}

export class OptionsSearchIdsCommand implements ICommand<Promise<number[]>> {
  constructor(private search: string, private from: number, private limit: number) {}
  async execute(): Promise<number[]> {
    const searchWords = this.search.toLowerCase().split(' ');

    const idsStats = new Map<number, { distance: number; id: number }>();
    let maxDistance = 0;
    // each word with corresponding ids
    const wordsIdsSet: Set<number>[] = [];
    for (const word of searchWords) {
      // we get words with distance
      const distanceIds = await this.getWordSet(word);
      const idsSet = new Set<number>();
      // iterate over each distance and over each id if id exists add distance so
      // word distance = sum(id, distance) of each id that is in getWordSet
      // simply we promote ids of words that have the smallest distance
      for (const obj of distanceIds) {
        for (const id of obj.ids) {
          const d = idsStats.get(id);
          if (d) {
            d.distance += obj.distance;
            idsStats.set(id, d);
          } else {
            idsStats.set(id, { distance: obj.distance, id });
          }
          maxDistance = Math.max(maxDistance, obj.distance);
          idsSet.add(id);
        }
      }
      // we save ids for each word
      wordsIdsSet.push(idsSet);
    }
    // iterate over word ids and if word is not in wordsIdsSet add max distance so
    // if we search for more than one word those that have all words won't get maxDistance penalty
    for (const data of idsStats.values()) {
      for (const set of wordsIdsSet) {
        if (!set.has(data.id)) {
          data.distance += maxDistance;
        }
      }
    }
    // finally sort by distance - the smallest distances first
    const idsArray = Array.from(idsStats.values())
      .reverse()
      .sort((a, b) => {
        if (a.distance > b.distance) {
          return 1;
        } else if (a.distance < b.distance) {
          return -1;
        }
        return 0;
      })
      .map((c) => c.id);

    const out: number[] = [];
    let skip = true;
    for (const objId of idsArray) {
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

  async getWordSet(search: string): Promise<DistanceIds[]> {
    const start = search.substring(0, 2);
    const key = `${ObjectStoreKeys.SEARCH_WORD}:${start}`;
    const words = await BrowserStorage.get<string[] | undefined>(key);
    if (!words) return [];

    const distanceWord: DistanceWord[] = [];
    let minDistance = 1_000_000;

    for (const word of words) {
      const d = distance(search, word);
      minDistance = Math.min(d, minDistance);
      distanceWord.push({ word, distance: d });
    }

    const distances: DistanceIds[] = [];

    for (const dw of distanceWord) {
      if (dw.distance > minDistance + 3) continue;
      const wordKey = `${ObjectStoreKeys.SEARCH_INDEX}:${dw.word}`;
      const ids = await BrowserStorage.get<number[] | undefined>(wordKey);
      if (!ids) continue;
      distances.push({ distance: dw.distance, ids, word: dw.word });
    }
    return distances;
  }
}
