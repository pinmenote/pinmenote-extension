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
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjDateIndex } from '../../../model/obj-index.model';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnTimestampKeyFormat } from '../../../fn/date.format.fn';

export class ObjUpdateIndexDelCommand implements ICommand<Promise<void>> {
  constructor(private index: ObjDateIndex) {}

  async execute(): Promise<void> {
    const yearMonth = fnTimestampKeyFormat(this.index.dt);
    const key = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;

    const ids = await this.getList(key);
    const idIndex = ids.findIndex((o) => o.id === this.index.id);
    if (idIndex > -1) {
      ids.splice(idIndex, 1);
      await BrowserStorageWrapper.set(key, ids);
    }
  }

  private async getList(key: string): Promise<ObjDateIndex[]> {
    const value = await BrowserStorageWrapper.get<ObjDateIndex[] | undefined>(key);
    return value || [];
  }
}
