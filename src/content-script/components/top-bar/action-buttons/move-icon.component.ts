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
import { PinDragStore } from '../../../store/pin-drag.store';
import { PinObject } from '@common/model/pin.model';
import { applyStylesToElement } from '@common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class MoveIconComponent {
  private start = { x: 0, y: 0 };
  private last = { x: 0, y: 0 };
  private el = document.createElement('div');
  constructor(private pin: PinObject) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 0 24 24" width="12">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
  </svg>`;

    this.el.addEventListener('mousedown', this.handleMouseDown);
    applyStylesToElement(this.el, iconButtonStyles);
    this.el.style.marginRight = '5px';
    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.start.x = e.clientX;
    this.start.y = e.clientY;
    PinDragStore.startDragPin(this.pin);
    if (PinDragStore.isDrag) {
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    this.last.x = e.clientX - this.start.x;
    this.last.y = e.clientY - this.start.y;
    PinDragStore.dragPin(this.last);
  };

  private handleMouseUp = async () => {
    await PinDragStore.stopDragPin(this.last);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };
}
