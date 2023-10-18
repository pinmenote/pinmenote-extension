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
import { SyncGetProgressCommand } from './progress/sync-get-progress.command';
import { SyncTxHelper } from './sync-tx.helper';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { SyncResetProgressCommand } from './progress/sync-reset-progress.command';
import { SyncServerIncomingCommand } from './sync-server-incoming.command';
import { SwSyncStore } from '../../sw-sync.store';
import { SyncMode } from '../../../common/model/sync.model';
import { SyncServerOutgoingCommand } from './sync-server-outgoing.command';

export class SyncServerCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    if (SwSyncStore.isInSync) return;
    const sub = await SyncTxHelper.syncSub();
    if (!sub) return;
    try {
      const a = Date.now();
      const progress = await new SyncGetProgressCommand(sub).execute();
      if (!progress) return;
      switch (progress.mode) {
        case SyncMode.OUTGOING_INCOMING:
          await new SyncServerOutgoingCommand(progress).execute();
          await new SyncServerIncomingCommand(progress).execute();
          break;
        case SyncMode.INCOMING:
          await new SyncServerIncomingCommand(progress).execute();
          break;
        case SyncMode.RESET:
          await new SyncResetProgressCommand(false).execute();
          break;
      }

      fnConsoleLog('SyncServerCommand->execute', progress, 'in', Date.now() - a);
    } finally {
      SwSyncStore.isInSync = false;
    }
  }
}
