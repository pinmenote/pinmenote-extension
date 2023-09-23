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
import { ICommand } from '../../../common/model/shared/common.dto';
import { SyncGetProgressCommand } from './progress/sync-get-progress.command';
import { SyncMonthCommand } from './sync-month.command';
import { SyncProgress } from './sync.model';
import { SyncTxHelper } from './sync-tx.helper';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnDateKeyFormat } from '../../../common/fn/fn-date-format';
import { ApiObjGetChangesCommand } from '../api/store/obj/api-obj-get-changes.command';
import { SyncObjIncomingHashCommand } from './incoming/sync-obj-incoming-hash.command';
import { SyncSetProgressCommand } from './progress/sync-set-progress.command';

export class SyncServerCommand implements ICommand<Promise<void>> {
  private static isInSync = false;

  async execute(): Promise<void> {
    if (SyncServerCommand.isInSync) return;
    if (!(await SyncTxHelper.shouldSync())) return;
    try {
      // await new SyncResetProgressCommand().execute();

      /*const token = await new TokenStorageGetCommand().execute();
      if (token) console.log(jwtDecode<TokenDataDto>(token.access_token));*/

      SyncServerCommand.isInSync = true;

      const a = Date.now();
      const progress = await new SyncGetProgressCommand().execute();
      await this.syncOutgoing(progress);
      await this.syncIncoming(progress);

      fnConsoleLog('SyncServerCommand->execute', progress, 'in', Date.now() - a);
    } finally {
      SyncServerCommand.isInSync = false;
    }
  }

  private async syncIncoming(progress: SyncProgress): Promise<void> {
    fnConsoleLog('SyncServerCommand->syncIncoming');
    const changesResp = await new ApiObjGetChangesCommand(progress.serverId).execute();
    if (!changesResp) return;
    for (let i = 0; i < changesResp.data.length; i++) {
      const change = changesResp.data[i];
      if (progress.serverId > change.serverId) continue;
      const result = await new SyncObjIncomingHashCommand(change).execute();
      fnConsoleLog('syncIncoming', result, 'serverId', change.serverId, 'localId', change.localId);
      if (result) {
        progress.serverId = change.serverId;
        await new SyncSetProgressCommand(progress).execute();
      } else {
        fnConsoleLog('SyncServerCommand->syncIncoming->ERROR !!!!!!!!!!!!!!!!!!!!1');
        return;
      }
    }
  }

  private async syncOutgoing(progress: SyncProgress): Promise<void> {
    // Empty list - fresh install
    if (progress.id == -1) return;
    const dt = fnDateToMonthFirstDay(new Date(progress.timestamp));
    const lastDay = fnMonthLastDay();

    while (dt < lastDay) {
      const yearMonth = fnDateKeyFormat(dt);
      const status = await new SyncMonthCommand(progress, yearMonth).execute();
      fnConsoleLog('sync', yearMonth, 'status', status);
      if (status < 0) {
        fnConsoleLog('SyncServerCommand->sync->SyncObjectStatus->error', status);
        return;
      }

      dt.setMonth(dt.getMonth() + 1);
    }
  }
}
