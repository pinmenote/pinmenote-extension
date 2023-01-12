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
import { HtmlComponent, HtmlComponentFocusable } from '../../common/model/html.model';
import { DrawComponent } from './draw/draw.component';
import { PinComponent } from './pin.component';
import { PinObject } from '../../common/model/pin.model';
import { applyStylesToElement } from '../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class DrawContainerComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private drawArea: DrawComponent;

  constructor(private object: PinObject, private rect: PinRectangle, private parent: PinComponent) {
    this.drawArea = new DrawComponent(this.rect);
  }

  render(): HTMLElement {
    const styles = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      display: 'none'
    };
    applyStylesToElement(this.el, styles);
    this.el.appendChild(this.drawArea.canvas);
    this.drawArea.render();

    return this.el;
  }

  resize(rect: PinRectangle): void {
    if (rect.width === this.rect.width && this.rect.height === rect.height) return;
    this.rect = rect;
    this.drawArea.resize(rect);
  }

  focusin(): void {
    this.el.style.display = 'inline-block';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  cleanup() {
    this.drawArea.cleanup();
  }
}