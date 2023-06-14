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
import { ICommand } from '../../model/shared/common.dto';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';

export class ObjGetCommand<T> implements ICommand<Promise<ObjDto<T>>> {
  constructor(private id: number) {}
  async execute(): Promise<ObjDto<T>> {
    return await BrowserStorage.get<ObjDto<T>>(`${ObjectStoreKeys.OBJECT_ID}:${this.id}`);
  }
}
