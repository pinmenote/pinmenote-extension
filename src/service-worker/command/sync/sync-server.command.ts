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
import { ApiHelper } from '../../api/api-helper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncGetProgressCommand } from './progress/sync-get-progress.command';
import { SyncProgress } from './sync.model';
import { SyncRemoteCommand } from './remote/sync-remote.command';
import { SyncRemoveListCommand } from './remove/sync-remove-list.command';
import { SyncSetProgressCommand } from './progress/sync-set-progress.command';
import { SyncUpdateListCommand } from './update/sync-update-list.command';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class SyncServerCommand implements ICommand<Promise<void>> {
  private static isInSync = false;

  async execute(): Promise<void> {
    if (SyncServerCommand.isInSync) return;

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
    while (dt < lastDay) {
      fnConsoleLog('SyncServerCommand->sync-loop', dt);
      await this.syncMonth(progress, dt);
      dt.setMonth(dt.getMonth() + 1);
    }
    await new SyncRemoteCommand().execute();
  }

  private async syncMonth(progress: SyncProgress, dt: Date): Promise<void> {
    progress.timestamp = dt.getTime();
    await new SyncSetProgressCommand(progress).execute();
    await new SyncUpdateListCommand().execute();
    await new SyncRemoveListCommand().execute();
  }

  private async shouldSync(): Promise<boolean> {
    const interval = (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.SYNC_INTERVAL)) || 0;
    fnConsoleLog('SyncServerCommand->shouldSync', Date.now() - interval);
    if (Date.now() - interval > 5_000) {
      await BrowserStorageWrapper.set<number>(ObjectStoreKeys.SYNC_INTERVAL, Date.now());

      const loggedIn = await ApiHelper.isLoggedIn();
      fnConsoleLog('SyncServerCommand->loggedIn', loggedIn);
      if (!loggedIn) return false;

      return true;
    }
    return false;
  }
}
