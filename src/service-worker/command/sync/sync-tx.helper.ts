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
import { ApiStoreBeginCommand } from '../api/store/api-store-begin.command';
import { ApiStoreCommitCommand } from '../api/store/api-store-commit.command';
import { BeginTxResponse } from '../api/store/api-store.model';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ObjDateIndex } from '../../../common/command/obj/index/obj-update-index-add.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { TokenStorageGetCommand } from '../../../common/command/server/token/token-storage-get.command';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class SyncTxHelper {
  static async begin(): Promise<BeginTxResponse | undefined> {
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

  static async commit(): Promise<void> {
    const tx = await BrowserStorage.get<BeginTxResponse | undefined>(ObjectStoreKeys.SYNC_TX);
    if (!tx) return;
    fnConsoleLog('SyncServerCommand->commit', tx);
    await new ApiStoreCommitCommand(tx.tx).execute();
    await BrowserStorage.remove(ObjectStoreKeys.SYNC_TX);
  }

  static async shouldSync(): Promise<boolean> {
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

  private static async isLoggedIn(): Promise<boolean> {
    const token = await new TokenStorageGetCommand().execute();
    return !!token;
  }

  static async getList(key: string): Promise<ObjDateIndex[]> {
    const value = await BrowserStorage.get<ObjDateIndex[] | undefined>(key);
    return value || [];
  }

  static async setList(key: string, value: ObjDateIndex[]) {
    await BrowserStorage.set(key, value);
  }
}
