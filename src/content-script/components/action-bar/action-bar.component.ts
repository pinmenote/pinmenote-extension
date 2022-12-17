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
import { MoveIconComponent } from './move-icon.component';
import { ParentIconComponent } from './parent-icon.component';
import { PinObject } from '@common/model/pin.model';
import { RemoveIconComponent } from './remove-icon.component';
import { applyStylesToElement } from '@common/style.utils';

const actionBtnStyles = {
  display: 'flex',
  'min-height': '15px',
  'max-height': '15px',
  'background-color': '#ffffff',
  color: '#000000',
  'justify-content': 'flex-end'
};

export class ActionBarComponent {
  private moveIcon: MoveIconComponent;
  private parentIcon: ParentIconComponent;
  private removeIcon: RemoveIconComponent;

  constructor(private pin: PinObject, private ref: HTMLElement) {
    this.moveIcon = new MoveIconComponent(pin);
    this.parentIcon = new ParentIconComponent(pin, ref);
    this.removeIcon = new RemoveIconComponent(pin);
  }
  render(): HTMLElement {
    const el = document.createElement('div');
    applyStylesToElement(el, actionBtnStyles);
    /* TODO drag drop
          el.draggable = true;
          el.addEventListener('dragstart', () => {
              fnConsoleLog('drag');
          })
      */
    el.appendChild(this.moveIcon.render());
    el.appendChild(this.parentIcon.render());
    el.appendChild(this.removeIcon.render());
    return el;
  }

  cleanup(): void {
    this.moveIcon.cleanup();
    this.parentIcon.cleanup();
    this.removeIcon.cleanup();
  }
}
