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
import { AddIconComponent } from './action-buttons/add-icon.component';
import { DrawIconComponent } from './action-buttons/draw-icon.component';
import { ParentIconComponent } from './action-buttons/parent-icon.component';
import { PinComponent } from '../pin.component';
import { PinObject } from '../../../common/model/pin.model';
import { RemoveIconComponent } from './action-buttons/remove-icon.component';
import { applyStylesToElement } from '../../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const topBarStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff'
};

const removeIconStyles = {
  right: `10px`,
  position: 'absolute',
  'background-color': '#ffffff00'
};

const parentIconStyles = {
  right: `34px`,
  position: 'absolute',
  'background-color': '#ffffff00'
};

const drawIconStyles = {
  left: '10px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

const addIconStyles = {
  left: '34px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

export class TopBarComponent implements HtmlComponent, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private readonly removeIcon: RemoveIconComponent;
  private readonly parentIcon: ParentIconComponent;

  private readonly drawIcon: DrawIconComponent;
  private readonly addIcon: AddIconComponent;

  constructor(private object: PinObject, private rect: PinRectangle, private parent: PinComponent) {
    this.removeIcon = new RemoveIconComponent(this.object);
    this.parentIcon = new ParentIconComponent(this.object, parent);
    this.drawIcon = new DrawIconComponent();
    this.addIcon = new AddIconComponent();
  }

  focusin(): void {
    this.el.style.display = 'inline-block';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, topBarStyles);
    applyStylesToElement(this.el, style);

    // right side
    const removeComponent = this.removeIcon.render();
    this.el.appendChild(removeComponent);
    applyStylesToElement(removeComponent, removeIconStyles);

    const parentComponent = this.parentIcon.render();
    this.el.appendChild(parentComponent);
    applyStylesToElement(parentComponent, parentIconStyles);

    // left side
    const drawComponent = this.drawIcon.render();
    this.el.appendChild(drawComponent);
    applyStylesToElement(drawComponent, drawIconStyles);

    const addComponent = this.addIcon.render();
    this.el.appendChild(addComponent);
    applyStylesToElement(addComponent, addIconStyles);

    return this.el;
  }

  resize(rect: PinRectangle): void {
    applyStylesToElement(this.el, {
      width: `${rect.width}px`
    });
  }

  cleanup(): void {
    this.removeIcon.cleanup();
    this.parentIcon.cleanup();
  }
}
