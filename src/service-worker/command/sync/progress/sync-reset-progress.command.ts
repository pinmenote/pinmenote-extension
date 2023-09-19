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
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { SyncGetProgressCommand } from './sync-get-progress.command';
import { SyncProgress } from '../sync.model';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { fnDateKeyFormat } from '../../../../common/fn/fn-date-format';
import { ObjDateIndex } from '../../../../common/command/obj/index/obj-update-index-add.command';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

export class SyncResetProgressCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const obj = await SyncGetProgressCommand.getFirstObject();
    await BrowserStorage.set<SyncProgress>(ObjectStoreKeys.SYNC_PROGRESS, {
      state: 'update',
      timestamp: obj.createdAt,
      id: obj.id
    });
    await this.resetObjects();
  }

  async resetObjects(): Promise<void> {
    let listId = await BrowserStorage.get<number>(ObjectStoreKeys.OBJECT_LIST_ID);
    const a = Date.now();
    console.log('SyncResetProgressCommand->start !!!!', listId);

    const toSortSet: Set<string> = new Set<string>();

    while (listId > 0) {
      const list = await BrowserStorage.get<number[]>(`${ObjectStoreKeys.OBJECT_LIST}:${listId}`);
      for (const id of list) {
        const obj = await BrowserStorage.get<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${id}`);
        const yearMonth = fnDateKeyFormat(new Date(obj.updatedAt));
        toSortSet.add(yearMonth);

        const updateList = await this.getList(yearMonth);
        if (updateList.findIndex((o) => o.id === obj.id) > 0) continue;

        updateList.push({ id: obj.id, dt: obj.updatedAt });

        await this.setList(yearMonth, updateList);
      }
      listId -= 1;
    }

    // sort objects inside
    for (const yearMonth of toSortSet) {
      let list = await this.getList(yearMonth);
      list = list.sort((a, b) => {
        if (a.dt > b.dt) return 1;
        if (a.dt < b.dt) return -1;
        if (a.id > b.id) return 1;
        if (a.id < b.id) return -1;
        return 0;
      });
    }
    fnConsoleLog('SyncResetProgressCommand->complete in ', Date.now() - a);
  }

  private async setList(yearMonth: string, list: ObjDateIndex[]): Promise<void> {
    const updateListKey = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;
    await BrowserStorage.set(updateListKey, list);
  }

  private async getList(yearMonth: string): Promise<ObjDateIndex[]> {
    const updateListKey = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;
    const updateList = await BrowserStorage.get<ObjDateIndex[] | undefined>(updateListKey);
    if (!updateList) return [];
    return updateList;
  }
}
