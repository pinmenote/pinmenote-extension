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
import { fnDateToMonthFirstDay, fnMonthLastDay } from '../../../common/fn/date.fn';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjRemoveIndexGetCommand } from '../../../common/command/obj/date-index/obj-remove-index-get.command';
import { ObjUpdateIndexGetCommand } from '../../../common/command/obj/date-index/obj-update-index-get.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncFirstDateCommand } from './sync-first-date.command';
import { SyncRemoveObjectCommand } from './sync-remove-object.command';
import { SyncTimeCommand } from './sync-time.command';
import { SyncUpdateObjectCommand } from './sync-update-object.command';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnSleep } from '../../../common/fn/sleep.fn';
import { fnYearMonthFormat } from '../../../common/fn/date.format.fn';

export class SyncServerCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    if (!(await this.shouldSync())) return;
    let timestamp = await new SyncTimeCommand().execute();
    if (timestamp === 0) {
      timestamp = await new SyncFirstDateCommand().execute();
    }
    const dt = new Date(timestamp);
    fnConsoleLog('SyncServerCommand->execute-timestamp', dt);
    await this.sync(dt);
  }

  private async sync(dt: Date): Promise<void> {
    dt = fnDateToMonthFirstDay(dt);
    const lastDay = fnMonthLastDay();
    fnConsoleLog('SyncServerCommand->today', lastDay, 'dt', dt, '<=', dt <= lastDay, dt.getTime(), lastDay.getTime());
    while (dt <= lastDay) {
      await this.syncMonth(dt);
      dt.setMonth(dt.getMonth() + 1);
      await fnSleep(100);
    }
  }

  private async syncMonth(dt: Date): Promise<void> {
    const yearMonth = fnYearMonthFormat(dt);
    const syncLocalId = (await BrowserStorageWrapper.get<number>(ObjectStoreKeys.SYNC_LOCAL_ID)) || 0;
    const updated = await new ObjUpdateIndexGetCommand(dt.getTime()).execute();
    const removed = await new ObjRemoveIndexGetCommand(dt.getTime()).execute();
    fnConsoleLog(
      'SyncServerCommand->syncMonth',
      yearMonth,
      'updated',
      updated,
      'removed',
      removed,
      'syncLocalId',
      syncLocalId
    );
    for (const id of updated) {
      await new SyncUpdateObjectCommand(id, dt).execute();
      await fnSleep(100);
    }
    for (const id of removed) {
      await new SyncRemoveObjectCommand(id).execute();
      await fnSleep(100);
    }
  }

  private async shouldSync(): Promise<boolean> {
    const interval = (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.SYNC_INTERVAL)) || 0;
    fnConsoleLog('SyncServerCommand->shouldSync', Date.now() - interval);
    if (Date.now() - interval > 10_000) {
      await BrowserStorageWrapper.set<number>(ObjectStoreKeys.SYNC_INTERVAL, Date.now());
      return true;
    }
    return false;
  }
}
