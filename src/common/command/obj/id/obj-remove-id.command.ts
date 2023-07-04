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

export class ObjRemoveIdCommand implements ICommand<Promise<void>> {
  constructor(private id: number, private key: string) {}
  async execute(): Promise<void> {
    const listId = await this.getListId();
    await this.removeFromList(listId);
  }

  private async removeFromList(listId: number): Promise<void> {
    const ids = await this.getList(listId);
    const idIndex = ids.indexOf(this.id);
    if (idIndex > -1) {
      ids.splice(idIndex, 1);
      const key = `${this.key}:${listId}`;
      await BrowserStorage.set(key, ids);
    } else if (listId > 1) {
      return this.removeFromList(listId - 1);
    }
  }

  private async getListId(): Promise<number> {
    const value = await BrowserStorage.get<number | undefined>(this.getListIdKey());
    return value || 1;
  }

  private async getList(listId: number): Promise<number[]> {
    const key = `${this.key}:${listId}`;
    const value = await BrowserStorage.get<number[] | undefined>(key);
    return value || [];
  }

  private getListIdKey() {
    switch (this.key) {
      case ObjectStoreKeys.OBJECT_LIST:
        return ObjectStoreKeys.OBJECT_LIST_ID;
      case ObjectStoreKeys.PIN_LIST:
        return ObjectStoreKeys.PIN_LIST_ID;
    }
    throw new Error(`Unsupported key ${this.key}`);
  }
}
