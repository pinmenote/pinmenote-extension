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
import { ApiObjGetChangesCommand } from '../api/store/obj/api-obj-get-changes.command';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { SyncObjIncomingCommand } from './incoming/sync-obj-incoming.command';
import { SyncSetProgressCommand } from './progress/sync-set-progress.command';
import { SyncProgress } from '../../../common/model/sync.model';
import { SwSyncStore } from '../../sw-sync.store';

export class SyncServerIncomingCommand implements ICommand<Promise<void>> {
  constructor(private progress: SyncProgress) {}
  async execute(): Promise<void> {
    if (SwSyncStore.isInSync) return;
    SwSyncStore.isInSync = true;
    try {
      const changesResp = await new ApiObjGetChangesCommand(this.progress.serverId).execute();
      fnConsoleLog('SyncServerIncomingCommand->START', changesResp);
      if ('code' in changesResp) return;
      for (let i = 0; i < changesResp.data.length; i++) {
        const change = changesResp.data[i];
        if (this.progress.serverId > change.serverId) continue;
        const result = await new SyncObjIncomingCommand(change).execute();
        fnConsoleLog('syncIncoming', result, 'serverId', change.serverId, 'localId', change.localId);
        if (result) {
          this.progress.serverId = change.serverId;
          await new SyncSetProgressCommand(this.progress).execute();
        } else {
          fnConsoleLog('SyncServerIncomingCommand->result-error !!!', change, 'result', result);
          return;
        }
      }
      fnConsoleLog('SyncServerIncomingCommand->COMPLETE !!!');
    } finally {
      SwSyncStore.isInSync = false;
    }
  }
}
