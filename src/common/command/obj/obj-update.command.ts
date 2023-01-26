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
import { ObjDataDto, ObjDto } from '../../model/obj.model';
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;

export class ObjUpdateCommand implements ICommand<Promise<void>> {
  constructor(private id: number, private data: ObjDataDto) {}
  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.id}`;
    const obj = await BrowserStorageWrapper.get<ObjDto>(key);
    obj.data = this.data;
    await BrowserStorageWrapper.set(key, obj);
  }
}
