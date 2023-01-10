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
import { HtmlComponent, HtmlComponentFocusable } from '../../../common/model/html.model';
import { ParentIconComponent } from './action-buttons/parent-icon.component';
import { PinComponent } from '../pin.component';
import { PinObject } from '../../../common/model/pin.model';
import { RemoveIconComponent } from './action-buttons/remove-icon.component';
import { applyStylesToElement } from '../../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class TopBarComponent implements HtmlComponent, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private readonly removeIcon: RemoveIconComponent;
  private readonly parentIcon: ParentIconComponent;

  constructor(private rect: PinRectangle, private object: PinObject, private parent: PinComponent) {
    this.removeIcon = new RemoveIconComponent(this.object);
    this.parentIcon = new ParentIconComponent(this.object, parent);
  }

  focusin(): void {
    this.el.style.display = 'flex';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, {
      top: '-24px',
      left: `${this.rect.x}px`,
      width: `${this.rect.width}px`,
      height: '24px',
      'background-color': '#ffffff',
      position: 'absolute'
    });
    const removeIconStyles = {
      right: `10px`,
      'background-color': '#ffffff00',
      position: 'absolute'
    };
    const removeComponent = this.removeIcon.render();
    this.el.appendChild(removeComponent);
    applyStylesToElement(removeComponent, removeIconStyles);

    const parentIconStyles = {
      right: `34px`,
      'background-color': '#ffffff00',
      position: 'absolute'
    };
    const parentComponent = this.parentIcon.render();
    this.el.appendChild(parentComponent);
    applyStylesToElement(parentComponent, parentIconStyles);
    return this.el;
  }

  resize(rect: PinRectangle): void {
    applyStylesToElement(this.el, {
      left: `${rect.x}px`,
      width: `${rect.width}px`
    });
  }

  cleanup(): void {
    this.removeIcon.cleanup();
    this.parentIcon.cleanup();
  }
}
