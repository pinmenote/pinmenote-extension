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
import { fnDateToMonthFirstDay, fnMonthLastDay } from '../../../common/fn/fn-date';
import { ApiStoreBeginCommand } from '../api/store/api-store-begin.command';
import { ApiStoreCommitCommand } from '../api/store/api-store-commit.command';
import { BeginTxResponse } from '../api/store/api-store.model';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDateIndex } from '../../../common/model/obj-index.model';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncGetProgressCommand } from './progress/sync-get-progress.command';
import { SyncProgress } from './sync.model';
import { SyncResetProgressCommand } from './progress/sync-reset-progress.command';
import { SyncSetProgressCommand } from './progress/sync-set-progress.command';
import { TokenStorageGetCommand } from '../../../common/command/server/token/token-storage-get.command';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnDateKeyFormat } from '../../../common/fn/fn-date-format';
import { fnSleep } from '../../../common/fn/fn-sleep';

export class SyncServerCommand implements ICommand<Promise<void>> {
  private static isInSync = false;

  async execute(): Promise<void> {
    if (!(await this.shouldSync())) return;
    try {
      // await new SyncResetProgressCommand().execute();

      SyncServerCommand.isInSync = true;

      const a = Date.now();
      const progress = await new SyncGetProgressCommand().execute();
      await this.sync(progress);

      fnConsoleLog('SyncServerCommand->execute-progress', progress, 'in', Date.now() - a);
    } finally {
      SyncServerCommand.isInSync = false;
    }
  }

  private async sync(progress: SyncProgress): Promise<void> {
    const dt = fnDateToMonthFirstDay(new Date(progress.timestamp));
    const lastDay = fnMonthLastDay();
    while (dt <= lastDay) {
      const yearMonth = fnDateKeyFormat(dt);
      await this.syncMonth(progress, yearMonth);
      dt.setMonth(dt.getMonth() + 1);
      fnConsoleLog('sync dt', dt, 'lastDay', lastDay);
    }
  }

  private async syncMonth(progress: SyncProgress, yearMonth: string): Promise<void> {
    fnConsoleLog('SyncServerCommand->syncMonth', yearMonth);

    const updatedDt = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;
    const indexList = await this.getList(updatedDt);
    fnConsoleLog('syncMonth->syncList', indexList);
    if (indexList.length === 0) return;
    await new SyncSetProgressCommand({
      id: indexList[0].id,
      timestamp: indexList[0].dt,
      state: 'update'
    }).execute();

    const nextObjectIndex = indexList.findIndex((value) => value.id === progress.id);
    fnConsoleLog('syncMonth->AAA', nextObjectIndex, indexList.length, progress, indexList[nextObjectIndex]);

    await this.begin();

    for (let i = nextObjectIndex; i < indexList.length; i++) {
      const index = indexList[i];
      await this.syncObject(progress, index);
    }

    await this.commit();
  }

  private syncObject = async (progress: SyncProgress, index: ObjDateIndex) => {
    const obj = await new ObjGetCommand(index.id).execute();
    if (!obj) {
      fnConsoleLog('syncObject EMPTY', index.id);
      return;
    }
    switch (obj.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        // const data = obj.data as ObjPageDto;
        // const pageSegment = await new PageSegmentGetCommand<SegmentPage>(data.snapshot.segmentHash).execute();
        fnConsoleLog(obj.type, obj.id, 'index', index, 'obj', obj);
        break;
      }
      case ObjTypeDto.PageElementPin: {
        fnConsoleLog(obj.type, obj.id, 'index', index, 'obj', obj);
        break;
      }
      default: {
        fnConsoleLog('PROBLEM');
        break;
      }
    }
    await fnSleep(10);
    await new SyncSetProgressCommand({ id: index.id, timestamp: index.dt, state: 'update' }).execute();
  };

  private async shouldSync(): Promise<boolean> {
    if (SyncServerCommand.isInSync) return false;
    const interval = (await BrowserStorage.get<number | undefined>(ObjectStoreKeys.SYNC_INTERVAL)) || 0;
    fnConsoleLog('SyncServerCommand->shouldSync', Date.now() - interval);
    if (Date.now() - interval > 5_000) {
      await BrowserStorage.set<number>(ObjectStoreKeys.SYNC_INTERVAL, Date.now());

      const loggedIn = await this.isLoggedIn();
      fnConsoleLog('SyncServerCommand->loggedIn', loggedIn);
      return loggedIn;
    }
    return false;
  }

  private async begin(): Promise<BeginTxResponse | undefined> {
    const tx = await BrowserStorage.get<BeginTxResponse | undefined>(ObjectStoreKeys.SYNC_TX);
    const expired = tx?.lockExpire ? tx?.lockExpire < Date.now() : false;
    fnConsoleLog('SyncServerCommand->begin', tx, 'tx expired', expired);
    if (!expired && tx) return tx;
    fnConsoleLog('SyncServerCommand->begin->ApiStoreBeginCommand');
    const txResponse = await new ApiStoreBeginCommand().execute();
    if (txResponse?.locked) return undefined;
    await BrowserStorage.set(ObjectStoreKeys.SYNC_TX, txResponse);
    return txResponse;
  }

  private async commit(): Promise<void> {
    const tx = await BrowserStorage.get<BeginTxResponse | undefined>(ObjectStoreKeys.SYNC_TX);
    if (!tx) return;
    fnConsoleLog('SyncServerCommand->commit', tx);
    await new ApiStoreCommitCommand(tx.tx).execute();
    await BrowserStorage.remove(ObjectStoreKeys.SYNC_TX);
  }

  private async isLoggedIn(): Promise<boolean> {
    const token = await new TokenStorageGetCommand().execute();
    return !!token;
  }

  private async getList(key: string): Promise<ObjDateIndex[]> {
    const value = await BrowserStorage.get<ObjDateIndex[] | undefined>(key);
    return value || [];
  }
}
