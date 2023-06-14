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
import { SyncSetProgressCommand } from '../progress/sync-set-progress.command';
import { SyncUpdateObjectCommand } from './sync-update-object.command';
import { fnSleep } from '../../../../common/fn/fn-sleep';

export class SyncUpdateListCommand implements ICommand<Promise<void>> {
  constructor(private yearMonth: string) {}

  async execute(): Promise<void> {
    const progress = await new SyncGetProgressCommand().execute();
    if (progress.state !== 'update') return;

    const key = `${ObjectStoreKeys.UPDATED_DT}:${this.yearMonth}`;
    const updated = await this.getList(key);

    for (let i = 0; i < updated.length; i++) {
      const index = updated[i];
      if (index.dt <= progress.timestamp) continue;

      const result = await new SyncUpdateObjectCommand(index).execute();

      // skip this run because we probably got server error
      if (!result) return;

      progress.timestamp = index.dt;
      await new SyncSetProgressCommand(progress).execute();
      await fnSleep(100);
    }
    // set this so we can progress with remove changes
    progress.state = 'remove';
    await new SyncSetProgressCommand(progress).execute();
  }

  private async getList(key: string): Promise<ObjDateIndex[]> {
    const value = await BrowserStorage.get<ObjDateIndex[] | undefined>(key);
    return value || [];
  }
}
