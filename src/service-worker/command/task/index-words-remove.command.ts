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

export class IndexWordsRemoveCommand implements ICommand<Promise<void>> {
  constructor(
    private task: SwTaskData<SwIndexWordsData>,
    private updateCallback: (task: SwTaskData) => Promise<void>
  ) {}

  async execute(): Promise<void> {
    const data: SwIndexWordsData = this.task.data;
    fnConsoleLog('IndexWordsRemoveCommand->execute', data.objectId, data.words);
    while (data.words.length > 0) {
      const word = data.words.shift();
      if (!word) break;

      await this.removeStorage(word, data.objectId);

      await this.updateCallback(this.task);
    }
  }

  private removeStorage = async (value: string, id: number) => {
    const key = `${ObjectStoreKeys.SEARCH_INDEX}:${value}`;
    const arr = await BrowserStorage.get<number[]>(key);
    if (!arr) return;

    const idx = arr.indexOf(id);
    if (idx === -1) return;

    arr.splice(idx, 1);
    if (arr.length === 0) {
      await BrowserStorage.remove(key);
      await this.removeWord(value);
    } else {
      await BrowserStorage.set<number[]>(key, arr);
    }
  };

  private removeWord = async (word: string) => {
    const start = word.substring(0, 2);
    const key = `${ObjectStoreKeys.SEARCH_WORD}:${start}`;
    const arr = await BrowserStorage.get<string[]>(key);
    if (!arr) return;

    const idx = arr.indexOf(word);
    if (idx === -1) return;

    arr.splice(idx, 1);
    if (arr.length === 0) {
      await BrowserStorage.remove(key);
    } else {
      await BrowserStorage.set<string[]>(key, arr);
    }
  };
}
