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
import { ObjDrawDto } from '../../../model/obj/obj-draw.dto';
import { ObjDto } from '../../../model/obj/obj.dto';
import { ObjPinDto } from '../../../model/obj/obj-pin.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnConsoleLog } from '../../../fn/fn-console';
import { fnSha256Object } from '../../../fn/fn-hash';

export class PinAddDrawCommand implements ICommand<Promise<void>> {
  constructor(private pin: ObjDto<ObjPinDto>, private draw: ObjDrawDto) {}
  async execute(): Promise<void> {
    fnConsoleLog('PinAddDrawCommand', this.draw);
    const draw: Omit<ObjDrawDto, 'hash'> = {
      size: this.draw.size,
      data: this.draw.data,
      updatedAt: this.draw.updatedAt,
      createdAt: this.draw.createdAt
    };
    const hash = fnSha256Object(draw);
    const pinDraw: ObjDrawDto = { ...draw, hash };

    this.pin.data.draw.data.push(hash);
    this.pin.local.drawVisible = true;

    await BrowserStorage.set(`${ObjectStoreKeys.PIN_DRAW}:${hash}`, pinDraw);
    await BrowserStorage.set(`${ObjectStoreKeys.OBJECT_ID}:${this.pin.id}`, this.pin);
  }
}
