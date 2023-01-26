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
import { ObjRectangleDto } from '../../../common/model/obj-utils.model';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';
import { fnConsoleLog } from '../../../common/fn/console.fn';

const editBarStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none'
};

export class PinEditBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private visible = false;

  constructor(private parent: PinComponent, private rect: ObjRectangleDto) {}

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, editBarStyles);
    applyStylesToElement(this.el, style);

    this.adjustTop();

    return this.el;
  }

  cleanup(): void {
    fnConsoleLog('cleanup');
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'inline-block';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  show(): void {
    this.visible = true;
    this.focusin();
  }

  hide(): void {
    this.visible = false;
    this.focusout();
  }

  resize(rect: ObjRectangleDto): void {
    this.rect = rect;
    this.el.style.width = `${rect.width}px`;
    this.adjustTop();
  }

  /**
   * Element is on top of page that's why we show bar overlapping element
   * @private
   */
  private adjustTop(): void {
    if (this.rect.y === 0) {
      this.el.style.top = '24px';
    } else {
      this.el.style.top = '-24px';
    }
  }
}
