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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ICommand } from '../../model/shared/common.dto';
import { LogManager } from '../../popup/log.manager';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';

export class SyncClearServerCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    let listId = await this.getListId();
    while (listId > 0) {
      const list = await this.getList(listId);
      await this.clearList(list);
      LogManager.log(`SyncClearServerCommand->listId ${listId}`);
      listId--;
    }
    // clear progress
    await BrowserStorageWrapper.remove(ObjectStoreKeys.SYNC_PROGRESS);
    LogManager.log(`SyncClearServerCommand->complete !!!`);
  }

  private async clearList(list: number[]): Promise<void> {
    for (const id of list) {
      LogManager.log(`SyncClearServerCommand->clearList ${id}`);
      const obj = await this.getObject(id);
      if (!obj) {
        LogManager.log(`Problem reading object ${id}`);
        continue;
      }
      obj.server = undefined;
      await this.setObject(id, obj);
    }
  }

  private async setObject(id: number, obj: ObjDto): Promise<void> {
    await BrowserStorageWrapper.set(`${ObjectStoreKeys.OBJECT_ID}:${id}`, obj);
  }

  private async getObject(id: number): Promise<ObjDto | undefined> {
    return BrowserStorageWrapper.get<ObjDto | undefined>(`${ObjectStoreKeys.OBJECT_ID}:${id}`);
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