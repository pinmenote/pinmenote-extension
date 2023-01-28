/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ObjDto } from '../../common/model/obj.model';

export class PinPendingStore {
  // Map of pending pins
  private static pendingPins: { [id: number]: ObjDto } = {};

  static get values(): ObjDto[] {
    return Object.values(PinPendingStore.pendingPins);
  }

  static add(pin: ObjDto): void {
    this.pendingPins[pin.id] = pin;
  }

  static remove(id: number): void {
    delete this.pendingPins[id];
  }
}
