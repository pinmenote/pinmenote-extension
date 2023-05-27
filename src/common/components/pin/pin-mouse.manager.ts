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

export class PinMouseManager {
  constructor(
    private top: HTMLElement,
    private bottom: HTMLElement,
    private handleMouseOver: () => void,
    private handleMouseOut: () => void
  ) {}

  start(ref: HTMLElement): void {
    this.top.addEventListener('mouseover', this.handleMouseOver);
    this.top.addEventListener('mouseout', this.handleMouseOut);
    this.bottom.addEventListener('mouseover', this.handleMouseOver);
    this.bottom.addEventListener('mouseout', this.handleMouseOut);
    ref.addEventListener('mouseover', this.handleMouseOver);
    ref.addEventListener('mouseout', this.handleMouseOut);
  }

  stop(ref: HTMLElement): void {
    this.top.removeEventListener('mouseover', this.handleMouseOver);
    this.top.removeEventListener('mouseout', this.handleMouseOut);
    this.bottom.removeEventListener('mouseover', this.handleMouseOver);
    this.bottom.removeEventListener('mouseout', this.handleMouseOut);
    ref.removeEventListener('mouseover', this.handleMouseOver);
    ref.removeEventListener('mouseout', this.handleMouseOut);
  }
}
