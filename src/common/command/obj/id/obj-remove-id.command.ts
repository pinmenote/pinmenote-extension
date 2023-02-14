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
import { ObjRemoveDtIndexCommand } from '../dt-index/obj-remove-dt-index.command';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;

export class ObjRemoveIdCommand implements ICommand<Promise<void>> {
  constructor(private id: number, private dt: Date) {}
  async execute(): Promise<void> {
    const listId = await this.getListId();
    await this.removeFromList(listId);

    await new ObjRemoveDtIndexCommand(this.id, this.dt).execute();
  }

  private async removeFromList(listId: number): Promise<void> {
    const ids = await this.getList(listId);
    const idIndex = ids.indexOf(this.id);
    if (idIndex > -1) {
      ids.splice(idIndex, 1);
      const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;
      await BrowserStorageWrapper.set(key, ids);
    } else if (listId > 1) {
      return this.removeFromList(listId - 1);
    }
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
