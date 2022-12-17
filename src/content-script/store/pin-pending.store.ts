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
import { HtmlObject } from '@common/model/html.model';

export class PinPendingStore {
  // Map of pending pins
  private static pendingPins: { [key: string]: HtmlObject } = {};

  static get values(): HtmlObject[] {
    return Object.values(PinPendingStore.pendingPins);
  }

  static add(pin: HtmlObject): void {
    this.pendingPins[pin.uid] = pin;
  }

  static remove(key: string): void {
    delete this.pendingPins[key];
  }
}
