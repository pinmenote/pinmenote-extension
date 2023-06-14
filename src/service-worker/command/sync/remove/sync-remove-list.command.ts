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
import { ObjDateIndex } from '../../../../common/model/obj-index.model';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { SyncGetProgressCommand } from '../progress/sync-get-progress.command';
import { SyncRemoveObjectCommand } from './sync-remove-object.command';
import { SyncSetProgressCommand } from '../progress/sync-set-progress.command';
import { fnSleep } from '../../../../common/fn/fn-sleep';

export class SyncRemoveListCommand implements ICommand<Promise<void>> {
  constructor(private yearMonth: string) {}
  async execute(): Promise<void> {
    const progress = await new SyncGetProgressCommand().execute();
    if (progress.state !== 'remove') return;

    const key = `${ObjectStoreKeys.REMOVED_DT}:${this.yearMonth}`;
    const removed = await this.getList(key);

    while (removed.length > 0) {
      const index = removed.shift();
      if (!index) continue;

      await new SyncRemoveObjectCommand(index.id).execute();

      await this.updateList(key, removed);

      await fnSleep(100);
    }

    progress.state = 'update';
    await new SyncSetProgressCommand(progress).execute();
  }

  private async getList(key: string): Promise<ObjDateIndex[]> {
    const value = await BrowserStorage.get<ObjDateIndex[] | undefined>(key);
    return value || [];
  }

  private async updateList(key: string, value: ObjDateIndex[]): Promise<void> {
    await BrowserStorage.set(key, value);
  }
}
