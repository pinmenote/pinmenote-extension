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
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnYearMonthFormat } from '../../../fn/date.format.fn';

export class ObjAddUpdatedDateIndexCommand implements ICommand<Promise<void>> {
  constructor(private id: number, private dt: number) {}

  async execute(): Promise<void> {
    const yearMonth = fnYearMonthFormat(new Date(this.dt));
    const key = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;

    const ids = await this.getList(key);
    ids.push(this.id);

    await BrowserStorageWrapper.set(key, ids);
  }

  private async getList(key: string): Promise<number[]> {
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }
}
