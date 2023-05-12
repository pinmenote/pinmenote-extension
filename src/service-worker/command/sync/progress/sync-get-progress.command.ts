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
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { SyncFirstDateCommand } from '../sync-first-date.command';
import { SyncProgress } from '../sync.model';

export class SyncGetProgressCommand implements ICommand<Promise<SyncProgress>> {
  async execute(): Promise<SyncProgress> {
    const sync = await BrowserStorageWrapper.get<SyncProgress | undefined>(ObjectStoreKeys.SYNC_PROGRESS);
    if (!sync) {
      const timestamp = await new SyncFirstDateCommand().execute();
      return { id: 0, state: 'update', timestamp };
    }
    return sync;
  }
}
