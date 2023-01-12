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
import { DrawContainerComponent } from '../draw-container.component';
import { applyStylesToElement } from '../../../common/style.utils';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const drawBarStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none'
};

export class DrawBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private visible = false;

  constructor(private rect: PinRectangle, private drawContainer: DrawContainerComponent) {}

  focusin(): void {
    if (this.visible) this.el.style.display = 'inline-block';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.visible) {
      this.focusin();
    } else {
      this.focusout();
    }
  }

  cleanup(): void {
    fnConsoleLog('cleanup');
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, drawBarStyles);
    applyStylesToElement(this.el, style);
    return this.el;
  }

  resize(rect: PinRectangle): void {
    applyStylesToElement(this.el, {
      width: `${rect.width}px`
    });
  }
}
