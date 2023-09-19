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
import { SyncIndex, SyncIndexCommand } from './sync-index.command';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncObjectStatus, SyncProgress } from './sync.model';
import { SyncTxHelper } from './sync-tx.helper';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { ObjDateIndex } from '../../../common/command/obj/index/obj-update-index-add.command';

export class SyncMonthCommand implements ICommand<Promise<SyncIndex>> {
  constructor(private progress: SyncProgress, private yearMonth: string) {}
  async execute(): Promise<SyncIndex> {
    // fnConsoleLog('SyncMonthCommand->syncMonth', this.yearMonth);

    const indexListKey = `${ObjectStoreKeys.UPDATED_DT}:${this.yearMonth}`;
    const indexList = await SyncTxHelper.getList(indexListKey);
    fnConsoleLog('SyncMonthCommand->syncList', indexList);

    if (indexList.length === 0)
      return { dt: this.progress.timestamp, id: this.progress.id, status: SyncObjectStatus.EMPTY_LIST };

    const lastIndexElement = indexList[indexList.length - 1];
    // fnConsoleLog('SyncMonthCommand->last', lastIndexElement, 'progress', this.progress);
    // we are last so escape early, so we don't waste request for begin / commit
    if (this.progress.id === lastIndexElement.id && this.progress.timestamp === lastIndexElement.dt)
      return { dt: this.progress.timestamp, id: this.progress.id, status: SyncObjectStatus.LAST_ELEMENT };

    let nextObjectIndex = indexList.findIndex((value) => value.id === this.progress.id);

    if (nextObjectIndex === -1) nextObjectIndex = 0;

    return this.syncIndex(indexList, nextObjectIndex);
  }

  async syncIndex(indexList: ObjDateIndex[], start: number): Promise<SyncIndex> {
    let index = { dt: this.progress.timestamp, id: this.progress.id, status: SyncObjectStatus.OK };

    const begin = await SyncTxHelper.begin();
    if (!begin) return { ...index, status: SyncObjectStatus.TX_LOCKED };

    for (let i = start; i < indexList.length; i++) {
      index = { ...indexList[i], status: SyncObjectStatus.OK };
      const status = await new SyncIndexCommand(this.progress, begin, index).execute();
      if ([SyncObjectStatus.SERVER_ERROR].includes(status)) {
        index = { ...index, status: SyncObjectStatus.SERVER_ERROR };
        fnConsoleLog('SERVER_ERROR !!!!!!!!!!!!!!!!!!!');
        await SyncTxHelper.commit();
        return index;
      }
      if (![SyncObjectStatus.INDEX_NOT_EXISTS, SyncObjectStatus.OBJECT_NOT_EXISTS].includes(status)) {
        console.log('PROBLEM !!!!!!!!!!!!!!!!!!!!!!!!', status);
        return { ...indexList[i], status };
      }
      fnConsoleLog('STATUS', status);
    }

    await SyncTxHelper.commit();
    fnConsoleLog('LOL !!!!!!!!!!!!!!!!!!!!!!!!!');
    return index;
  }
}
