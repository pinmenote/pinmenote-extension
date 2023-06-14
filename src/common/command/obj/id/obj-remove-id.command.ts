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
import { ObjCreateIndexDelCommand } from '../date-index/obj-create-index-del.command';
import { ObjDateIndex } from '../../../model/obj-index.model';
import { ObjRemoveIndexAddCommand } from '../date-index/obj-remove-index-add.command';
import { ObjUpdateIndexDelCommand } from '../date-index/obj-update-index-del.command';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';

export class ObjRemoveIdCommand implements ICommand<Promise<void>> {
  constructor(private index: ObjDateIndex, private serverId?: number) {}
  async execute(): Promise<void> {
    const listId = await this.getListId();
    await this.removeFromList(listId);

    await new ObjCreateIndexDelCommand(this.index).execute();
    await new ObjUpdateIndexDelCommand(this.index).execute();
    // we only care about objects with serverId because we want to mark it as deleted on server,
    // so it will be deleted from all devices
    if (!this.serverId) return;
    await new ObjRemoveIndexAddCommand({ id: this.serverId, dt: this.index.dt }).execute();
  }

  private async removeFromList(listId: number): Promise<void> {
    const ids = await this.getList(listId);
    const idIndex = ids.indexOf(this.index.id);
    if (idIndex > -1) {
      ids.splice(idIndex, 1);
      const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;
      await BrowserStorage.set(key, ids);
    } else if (listId > 1) {
      return this.removeFromList(listId - 1);
    }
  }

  private async getListId(): Promise<number> {
    const value = await BrowserStorage.get<number | undefined>(ObjectStoreKeys.OBJECT_LIST_ID);
    return value || 1;
  }

  private async getList(listId: number): Promise<number[]> {
    const key = `${ObjectStoreKeys.OBJECT_LIST}:${listId}`;
    const value = await BrowserStorage.get<number[] | undefined>(key);
    return value || [];
  }
}
