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
import jwtDecode from 'jwt-decode';
import { TokenDataDto } from '../../../common/model/shared/token.dto';

const SYNC_DELAY = 10_0000;

export class SyncTxHelper {
  static async begin(): Promise<BeginTxResponse | undefined> {
    const tx = await BrowserStorage.get<BeginTxResponse | undefined>(ObjectStoreKeys.SYNC_TX);
    if (tx) return tx;
    const txResponse = await new ApiStoreBeginCommand().execute();
    if (txResponse?.locked) {
      const token = await new TokenStorageGetCommand().execute();
      if (!token) return undefined;
      const tokenData = jwtDecode<TokenDataDto>(token.access_token);
      fnConsoleLog(
        'locked',
        txResponse?.locked,
        txResponse,
        tokenData,
        tokenData.refresh_token.syncToken === txResponse.lockedBy
      );
      if (tokenData.refresh_token.syncToken === txResponse.lockedBy) {
        await BrowserStorage.set(ObjectStoreKeys.SYNC_TX, txResponse);
        return txResponse;
      }
      return undefined;
    }
    await BrowserStorage.set(ObjectStoreKeys.SYNC_TX, txResponse);
    return txResponse;
  }

  static async commit(): Promise<void> {
    const tx = await BrowserStorage.get<BeginTxResponse | undefined>(ObjectStoreKeys.SYNC_TX);
    if (!tx) return;
    fnConsoleLog('SyncServerCommand->commit', tx);
    await new ApiStoreCommitCommand(tx).execute();
    await BrowserStorage.remove(ObjectStoreKeys.SYNC_TX);
  }

  static async shouldSync(): Promise<boolean> {
    const interval = (await BrowserStorage.get<number | undefined>(ObjectStoreKeys.SYNC_INTERVAL)) || 0;
    fnConsoleLog('SyncServerCommand->shouldSync', Date.now() - interval);
    if (Date.now() - interval > SYNC_DELAY) {
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
}
