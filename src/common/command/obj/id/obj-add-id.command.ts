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
import { ObjUpdateLastIdCommand } from './obj-update-last-id.command';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { environmentConfig } from '../../../environment';
import ICommand = Pinmenote.Common.ICommand;

export class ObjAddIdCommand implements ICommand<Promise<void>> {
  private readonly listLimit = environmentConfig.objListLimit;

  constructor(private id: number) {}
  async execute(): Promise<void> {
    let listId = await this.getListId();
    let ids = await this.getList(listId);

    // hit limit so create new list
    // this way we get faster writes and can batch
    if (ids.length >= this.listLimit) {
      listId += 1;
      ids = [];
      await BrowserStorageWrapper.set(ObjectStoreKeys.OBJECT_LIST_ID, listId);
    }

    ids.push(this.id);
    const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;

    await BrowserStorageWrapper.set(key, ids);
    await new ObjUpdateLastIdCommand(this.id).execute();
  }

  private async getListId(): Promise<number> {
    const value = await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_LIST_ID);
    return value || 1;
  }

  private async getList(listId: number): Promise<number[]> {
    const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }
}
