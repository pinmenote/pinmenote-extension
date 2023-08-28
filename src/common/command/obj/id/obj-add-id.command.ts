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
import { ObjDateIndex, ObjUpdateIndexAddCommand } from '../index/obj-update-index-add.command';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { environmentConfig } from '../../../environment';

const listLimit = environmentConfig.objListLimit;

export class ObjAddIdCommand implements ICommand<Promise<void>> {
  constructor(private index: ObjDateIndex, private key: string) {}
  async execute(): Promise<void> {
    let listId = await this.getListId();
    let ids = await this.getList(listId);

    // hit limit so create new list
    // this way we get faster writes and can batch
    if (ids.length >= listLimit) {
      listId += 1;
      ids = [];
      await BrowserStorage.set(this.getListIdKey(), listId);
    }

    ids.push(this.index.id);
    const key = `${this.key}:${listId}`;

    await BrowserStorage.set(key, ids);

    await new ObjUpdateIndexAddCommand(this.index).execute();
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
