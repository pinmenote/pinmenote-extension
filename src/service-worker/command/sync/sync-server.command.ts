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
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncGetProgressCommand } from './progress/sync-get-progress.command';
import { SyncProgress } from './sync.model';
import { TokenStorageGetCommand } from '../../../common/command/server/token/token-storage-get.command';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnDateKeyFormat } from '../../../common/fn/fn-date-format';

export class SyncServerCommand implements ICommand<Promise<void>> {
  private static isInSync = false;

  async execute(): Promise<void> {
    if (!(await this.shouldSync())) return;
    try {
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
    await this.begin();
    while (dt <= lastDay) {
      const yearMonth = fnDateKeyFormat(dt);
      await this.syncMonth(yearMonth);
      dt.setMonth(dt.getMonth() + 1);
      fnConsoleLog('sync dt', dt, 'lastDay', lastDay);
    }
    await this.commit();
  }

  private async syncMonth(yearMonth: string): Promise<void> {
    fnConsoleLog('SyncServerCommand->syncMonth', yearMonth);
    const updatedDt = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;
    const updated = await this.getList(updatedDt);
    fnConsoleLog('syncMonth->updated', updated);
    const removedDt = `${ObjectStoreKeys.REMOVED_DT}:${yearMonth}`;
    const removed = await this.getList(removedDt);
    fnConsoleLog('syncMonth->removed', removed);
  }

  private async shouldSync(): Promise<boolean> {
    if (SyncServerCommand.isInSync) return false;
    const interval = (await BrowserStorage.get<number | undefined>(ObjectStoreKeys.SYNC_INTERVAL)) || 0;
    fnConsoleLog('SyncServerCommand->shouldSync', Date.now() - interval);
    if (Date.now() - interval > 5_000) {
      await BrowserStorage.set<number>(ObjectStoreKeys.SYNC_INTERVAL, Date.now());

      const loggedIn = await this.isLoggedIn();
      fnConsoleLog('SyncServerCommand->loggedIn', loggedIn);
      if (!loggedIn) return false;

      return true;
    }
    return false;
  }

  private async begin(): Promise<BeginTxResponse | undefined> {
    const tx = await BrowserStorage.get<BeginTxResponse | undefined>(ObjectStoreKeys.SYNC_TX);
    fnConsoleLog('begin', tx);
    if (tx) return tx;
    const txResponse = await new ApiStoreBeginCommand().execute();
    if (txResponse?.locked) return undefined;
    await BrowserStorage.set(ObjectStoreKeys.SYNC_TX, txResponse);
    return txResponse;
  }

  private async commit(): Promise<void> {
    const tx = await BrowserStorage.get<BeginTxResponse | undefined>(ObjectStoreKeys.SYNC_TX);
    fnConsoleLog('commit', tx);
    if (!tx) return;
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
