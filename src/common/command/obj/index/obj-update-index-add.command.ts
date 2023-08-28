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
import { ICommand } from '../../../model/shared/common.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnDateKeyFormat } from '../../../fn/fn-date-format';

export interface ObjDateIndex {
  id: number;
  dt: number;
}

export class ObjUpdateIndexAddCommand implements ICommand<Promise<void>> {
  constructor(private index: ObjDateIndex) {}

  async execute(): Promise<void> {
    const yearMonth = fnDateKeyFormat(new Date(this.index.dt));
    const key = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;

    const ids = await this.getList(key);

    // always add as last id to maintain the date order
    const idIndex = ids.findIndex((o) => o.id === this.index.id);
    if (idIndex > -1) ids.splice(idIndex, 1);

    ids.push(this.index);
    await BrowserStorage.set(key, ids);
  }

  private async getList(key: string): Promise<ObjDateIndex[]> {
    const value = await BrowserStorage.get<ObjDateIndex[] | undefined>(key);
    return value || [];
  }
}
