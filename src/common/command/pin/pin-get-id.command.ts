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
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { PinObject } from '../../model/pin.model';
import ICommand = Pinmenote.Common.ICommand;

export class PinGetIdCommand implements ICommand<Promise<PinObject>> {
  constructor(private id: number) {}
  async execute(): Promise<PinObject> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.id}`;
    return await BrowserStorageWrapper.get<PinObject>(key);
  }
}
