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
import { PinAddFactory } from '../factory/pin-add.factory';

export class DocumentMediator {
  static startListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('mouseover', this.handleMouseOver);
  }

  static stopListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('mouseover', this.handleMouseOver);
    PinAddFactory.clear();
  }

  private static handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.stopListeners();
    }
  };

  private static handleMouseOver = (event: MouseEvent): void => {
    if (PinAddFactory.hasElement) {
      PinAddFactory.clear();
    }
    if (event.target instanceof HTMLElement) {
      PinAddFactory.updateElement(event.target);
    }
  };
}
