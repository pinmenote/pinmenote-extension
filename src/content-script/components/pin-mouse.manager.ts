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
import { PinComponent } from './pin.component';

export class PinMouseManager {
  constructor(private pin: PinComponent, private handleMouseOver: () => void, private handleMouseOut: () => void) {}

  start(): void {
    this.pin.top.addEventListener('mouseover', this.handleMouseOver);
    this.pin.top.addEventListener('mouseout', this.handleMouseOut);
    this.pin.bottom.addEventListener('mouseover', this.handleMouseOver);
    this.pin.bottom.addEventListener('mouseout', this.handleMouseOut);
    this.pin.ref.addEventListener('mouseover', this.handleMouseOver);
    this.pin.ref.addEventListener('mouseout', this.handleMouseOut);
  }

  stop(): void {
    this.pin.top.removeEventListener('mouseover', this.handleMouseOver);
    this.pin.top.removeEventListener('mouseout', this.handleMouseOut);
    this.pin.bottom.removeEventListener('mouseover', this.handleMouseOver);
    this.pin.bottom.removeEventListener('mouseout', this.handleMouseOut);
    this.pin.ref.removeEventListener('mouseover', this.handleMouseOver);
    this.pin.ref.removeEventListener('mouseout', this.handleMouseOut);
  }
}
