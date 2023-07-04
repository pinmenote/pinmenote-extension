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
import { ObjPinDto } from '../../model/obj/obj-pin.dto';
import { ObjUpdateIndexAddCommand } from '../obj/date-index/obj-update-index-add.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/fn-console';

export class PinUpdateCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjPinDto>) {}
  async execute(): Promise<void> {
    fnConsoleLog('PinUpdateCommand->execute', this.obj);
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;

    this.obj.updatedAt = Date.now();

    await BrowserStorage.set(key, this.obj);

    await new ObjUpdateIndexAddCommand({ id: this.obj.id, dt: this.obj.updatedAt }).execute();
  }
}
