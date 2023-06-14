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
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDateIndex } from '../../../../common/model/obj-index.model';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjUpdateIndexDelCommand } from '../../../../common/command/obj/date-index/obj-update-index-del.command';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';

export class SyncUpdateObjectCommand implements ICommand<Promise<boolean>> {
  constructor(private index: ObjDateIndex) {}
  async execute(): Promise<boolean> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.index.id}`;
    const obj = await BrowserStorage.get<ObjDto>(key);

    // some error when you update object then you remove it - remove from index cause no object found
    if (!obj) {
      await new ObjUpdateIndexDelCommand(this.index).execute();
      return false;
    }

    return true;
  }
}
