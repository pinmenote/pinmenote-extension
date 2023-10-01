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
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { fnDateKeyFormat } from '../../../../common/fn/fn-date-format';
import { ObjDateIndex } from '../../../../common/command/obj/index/obj-update-index-add.command';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { SyncProgress } from '../../../../common/model/sync.model';

export class SyncResetProgressCommand implements ICommand<Promise<void>> {
  constructor(private refreshUpdateList = false) {}
  async execute(): Promise<void> {
    const obj = await SyncGetProgressCommand.getFirstObject();
    const timestamp = obj?.createdAt || -1;
    const id = obj?.id || -1;
    await BrowserStorage.set<SyncProgress>(ObjectStoreKeys.SYNC_PROGRESS, {
      timestamp,
      id,
      serverId: -1
    });
    // await this.resetObjects();
  }

  async resetObjects(): Promise<void> {
    let listId = await BrowserStorage.get<number>(ObjectStoreKeys.OBJECT_LIST_ID);
    fnConsoleLog('SyncResetProgressCommand->start !!!!', listId);
    const a = Date.now();

    const toSortSet: Set<string> = new Set<string>();

    while (listId > 0) {
      const list = await BrowserStorage.get<number[]>(`${ObjectStoreKeys.OBJECT_LIST}:${listId}`);
      for (const id of list) {
        const obj = await BrowserStorage.get<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${id}`);

        if (obj.server) {
          await BrowserStorage.remove(`${ObjectStoreKeys.SERVER_ID}:${obj.server.id}`);
          delete obj['server'];
          await BrowserStorage.set(`${ObjectStoreKeys.OBJECT_ID}:${id}`, obj);
        }

        const yearMonth = fnDateKeyFormat(new Date(obj.updatedAt));
        toSortSet.add(yearMonth);

        if (this.refreshUpdateList) await this.updateList(yearMonth, obj);
      }
      listId -= 1;
      fnConsoleLog('SyncResetProgressCommand', listId);
    }

    // sort objects inside
    if (this.refreshUpdateList) await this.sortUpdateList(toSortSet);
    // clear tx
    await BrowserStorage.remove(ObjectStoreKeys.SYNC_TX);
    fnConsoleLog('SyncResetProgressCommand->complete in ', Date.now() - a);
  }

  private sortUpdateList = async (toSortSet: Set<string>) => {
    for (const yearMonth of toSortSet) {
      const list = await this.getList(yearMonth);
      const s = new Set<number>();
      let newList = [];
      for (const el of list) {
        if (!s.has(el.id)) {
          s.add(el.id);
          newList.push(el);
        }
      }
      newList = newList.sort((a, b) => {
        if (a.dt > b.dt) return 1;
        if (a.dt < b.dt) return -1;
        if (a.id > b.id) return 1;
        if (a.id < b.id) return -1;
        return 0;
      });
      await this.setList(yearMonth, newList);
    }
  };

  private updateList = async (yearMonth: string, obj: ObjDto) => {
    const updateList = await this.getList(yearMonth);
    if (updateList.findIndex((o) => o.id === obj.id) > 0) return;

    updateList.push({ id: obj.id, dt: obj.updatedAt });

    await this.setList(yearMonth, updateList);
  };

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
