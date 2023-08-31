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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { SyncGetProgressCommand } from './sync-get-progress.command';
import { SyncProgress } from '../sync.model';

export class SyncResetProgressCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const obj = await SyncGetProgressCommand.getFirstObject();
    await BrowserStorage.set<SyncProgress>(ObjectStoreKeys.SYNC_PROGRESS, {
      state: 'update',
      timestamp: obj.createdAt,
      id: obj.id
    });
  }
}