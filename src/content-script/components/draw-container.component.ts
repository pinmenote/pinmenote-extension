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
import { DrawAreaComponent } from './draw/draw-area.component';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { PinComponent } from './pin.component';
import { applyStylesToElement } from '../../common/style.utils';

export class DrawContainerComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  readonly drawArea: DrawAreaComponent;

  constructor(private parent: PinComponent, private rect: ObjRectangleDto) {
    this.drawArea = new DrawAreaComponent(parent, rect);
  }

  render(): HTMLElement {
    const styles = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      display: 'none'
    };
    applyStylesToElement(this.el, styles);
    this.el.appendChild(this.drawArea.rasterCanvas);
    this.el.appendChild(this.drawArea.drawCanvas);
    this.drawArea.render();

    return this.el;
  }

  resize(rect: ObjRectangleDto): void {
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
