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

export interface TxObj {
  id: number;
  op: 'add' | 'upd' | 'del';
  type: string;
  updatedAt: number;
  createdAt: number;
}

export interface HashTxSegment {
  op: 'add' | 'del';
  hash: [];
}

export interface TxLogMessage {
  id: number;
  obj?: TxObj;
  segment?: HashTxSegment;
}

export class AddTxCommand implements ICommand<Promise<void>> {
  constructor(private obj: TxObj, private segment: HashTxSegment) {}
  async execute(): Promise<void> {
    const yearMonth = fnDateKeyFormat(new Date());

    const key = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;

    const log = await this.getList(key);

    const id = await this.nextId();
    log.push({ id, obj: this.obj, segment: this.segment });

    await BrowserStorage.set(key, log);
  }

  private async getList(key: string): Promise<TxLogMessage[]> {
    const value = await BrowserStorage.get<TxLogMessage[] | undefined>(key);
    return value || [];
  }

  private async nextId(): Promise<number> {
    const value = await BrowserStorage.get<number | undefined>(ObjectStoreKeys.TX_ID);
    if (value) {
      await BrowserStorage.set(ObjectStoreKeys.TX_ID, value + 1);
      return value + 1;
    }
    await BrowserStorage.set(ObjectStoreKeys.TX_ID, 1);
    return 1;
  }
}
