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
import { ICommand } from '../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnDateToMonthFirstDay, fnMonthLastDay } from '../../../common/fn/fn-date';
import { fnDateKeyFormat } from '../../../common/fn/fn-date-format';
import { SyncMonthCommand } from './sync-month.command';
import { SyncProgress } from '../../../common/model/sync.model';
import { SwSyncStore } from '../../sw-sync.store';

export class SyncServerOutgoingCommand implements ICommand<Promise<void>> {
  constructor(private progress?: SyncProgress) {}

  async execute(): Promise<void> {
    if (!this.progress) return;
    if (SwSyncStore.isInSync) return;
    SwSyncStore.isInSync = true;
    try {
      fnConsoleLog('SyncServerOutgoingCommand->START !!!');
      // Empty list - fresh install
      if (this.progress.id == -1) return;
      const dt = fnDateToMonthFirstDay(new Date(this.progress.timestamp));
      const lastDay = fnMonthLastDay();

      while (dt < lastDay) {
        const yearMonth = fnDateKeyFormat(dt);
        const status = await new SyncMonthCommand(this.progress, yearMonth).execute();
        fnConsoleLog('sync', yearMonth, 'status', status);
        if (status < 0) {
          fnConsoleLog('SyncServerOutgoingCommand->status-error', status);
          return;
        }

        dt.setMonth(dt.getMonth() + 1);
      }
      fnConsoleLog('SyncServerOutgoingCommand->COMPLETE !!!');
    } finally {
      SwSyncStore.isInSync = false;
    }
  }
}
