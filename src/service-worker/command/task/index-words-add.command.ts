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
import { SwIndexWordsData, SwTaskData } from '../../../common/model/sw-task.model';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class IndexWordsAddCommand implements ICommand<Promise<void>> {
  constructor(
    private task: SwTaskData<SwIndexWordsData>,
    private updateCallback: (task: SwTaskData) => Promise<void>
  ) {}

  async execute(): Promise<void> {
    const data: SwIndexWordsData = this.task.data;

    fnConsoleLog('IndexWordsAddCommand->execute', data.objectId, data.words);
    const a = Date.now();

    while (data.words.length > 0) {
      const word = data.words.shift();
      if (!word) break;

      await this.saveStorage(word, data.objectId);
      await this.saveWord(word);

      await this.updateCallback(this.task);
    }

    fnConsoleLog('IndexWordsAddCommand->index->in', Date.now() - a);
  }

  private saveStorage = async (word: string, id: number) => {
    // TODO this limitation needs review
    if (word.length < 3) return;
    const key = `${ObjectStoreKeys.SEARCH_INDEX}:${word}`;

    let arr = await BrowserStorage.get<number[] | undefined>(key);

    if (arr && arr.indexOf(id) !== -1) return;

    if (arr) {
      arr.push(id);
    } else {
      arr = [id];
    }
    await BrowserStorage.set<number[]>(key, arr);
  };

  private saveWord = async (word: string): Promise<void> => {
    // TODO this limitation needs review
    if (word.length < 3) return;
    const start = word.substring(0, 2);
    await this.saveStartIndex(start);

    const key = `${ObjectStoreKeys.SEARCH_WORD}:${start}`;
    let arr = await BrowserStorage.get<string[] | undefined>(key);

    if (arr && arr.indexOf(word) !== -1) return;

    if (arr) {
      arr.push(word);
    } else {
      arr = [word];
    }
    await BrowserStorage.set<string[]>(key, arr);
  };

  private saveStartIndex = async (start: string): Promise<void> => {
    const key = `${ObjectStoreKeys.SEARCH_START}`;
    let arr = await BrowserStorage.get<string[]>(key);
    if (arr) {
      const idx = arr.indexOf(start);
      if (idx !== -1) return;
      arr.push(start);
    } else {
      arr = [start];
    }
    await BrowserStorage.set<string[]>(key, arr);
  };
}
