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
import { SyncIndexCommand } from './sync-index.command';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncObjectStatus, SyncProgress } from './sync.model';
import { SyncTxHelper } from './sync-tx.helper';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { ObjDateIndex } from '../../../common/command/obj/index/obj-update-index-add.command';
import { SyncSetProgressCommand } from './progress/sync-set-progress.command';
import { BrowserStorage } from '@pinmenote/browser-api';

export class SyncMonthCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private progress: SyncProgress, private yearMonth: string) {}
  async execute(): Promise<SyncObjectStatus> {
    // fnConsoleLog('SyncMonthCommand->syncMonth', this.yearMonth);

    const indexListKey = `${ObjectStoreKeys.UPDATED_DT}:${this.yearMonth}`;
    const indexList = await SyncTxHelper.getList(indexListKey);
    fnConsoleLog('SyncMonthCommand->syncList', this.yearMonth, 'size', indexList.length);

    if (indexList.length === 0) return SyncObjectStatus.EMPTY_LIST;

    const lastIndexElement = indexList[indexList.length - 1];
    // fnConsoleLog('SyncMonthCommand->last', lastIndexElement, 'progress', this.progress);
    // we are last so escape early, so we don't waste request for begin / commit
    if (this.progress.id === lastIndexElement.id && this.progress.timestamp === lastIndexElement.dt) {
      // TODO check if last object got deleted
      return SyncObjectStatus.LAST_ELEMENT;
    }

    let nextObjectIndex = indexList.findIndex((value) => value.id === this.progress.id);

    if (nextObjectIndex === -1) nextObjectIndex = 0;

    return this.syncIndex(indexList, nextObjectIndex);
  }

  async syncIndex(indexList: ObjDateIndex[], start: number): Promise<SyncObjectStatus> {
    const begin = await SyncTxHelper.begin();
    if (!begin) return SyncObjectStatus.TX_LOCKED;
    let i = start;
    let status = SyncObjectStatus.OK;
    for (i; i < indexList.length; i++) {
      status = await new SyncIndexCommand(this.progress, begin, indexList[i].id).execute();
      switch (status) {
        case SyncObjectStatus.SERVER_ERROR: {
          fnConsoleLog('SERVER_ERROR !!!!!!!!!!!!!!!!!!!');
          await SyncTxHelper.commit();
          await this.updateProgress(indexList[i].id, indexList[i].dt);
          return status;
        }
        case SyncObjectStatus.INDEX_NOT_EXISTS:
        case SyncObjectStatus.OBJECT_NOT_EXISTS:
          fnConsoleLog('syncIndex->PROBLEM !!!!!!!!!!!!!!!!!!!!!!!!', status, 'index', indexList[i]);
          break;
        default:
          await this.updateProgress(indexList[i].id, indexList[i].dt);
          break;
      }
    }
    // skip this month
    const lastIndex = indexList[indexList.length - 1];
    const now = new Date();
    const ts = new Date(lastIndex.dt);
    const lastId = await BrowserStorage.get(ObjectStoreKeys.OBJECT_ID);
    // check if current month and year
    let resetMonth = !(now.getMonth() === ts.getMonth() && now.getFullYear() === ts.getFullYear());
    fnConsoleLog('resetMonth->month/year', resetMonth);
    // check last id
    if (resetMonth) {
      resetMonth = lastId !== lastIndex.id;
      fnConsoleLog('resetMonth->lastId', resetMonth);
    }
    // check if object not exists
    if (resetMonth) {
      resetMonth = ![SyncObjectStatus.INDEX_NOT_EXISTS, SyncObjectStatus.OBJECT_NOT_EXISTS].includes(status);
      fnConsoleLog('resetMonth->status', resetMonth, status);
    }
    // all conditions (not current year/month, not last id, object exists) are met
    if (resetMonth) await this.updateProgress(-1, lastIndex.dt);

    await SyncTxHelper.commit();
    return SyncObjectStatus.OK;
  }

  private async updateProgress(id: number, timestamp: number): Promise<void> {
    await new SyncSetProgressCommand({
      id,
      timestamp,
      state: 'update'
    }).execute();
  }
}
