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
import { HtmlComponent, PageComponent } from '../../common/model/html.model';
import { ObjCanvasPinDto } from '../../common/model/obj-pin.model';
import { ObjDto } from '../../common/model/obj.model';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/console.fn';

const elStyles = {
  position: 'absolute',
  'font-family': 'Roboto,serif',
  'z-index': 'calc(9e999)',
  display: 'flex',
  'flex-direction': 'column',
  'background-color': '#ff0000'
};

export class CanvasPinComponent implements HtmlComponent<void>, PageComponent {
  readonly el = document.createElement('div');

  constructor(readonly object: ObjDto<ObjCanvasPinDto>) {}

  render(): void {
    const { x, y, width, height } = this.object.data.rect;
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
    this.el.style.minWidth = `${width}px`;
    this.el.style.minHeight = `${height}px`;
    applyStylesToElement(this.el, elStyles);
    document.body.appendChild(this.el);
  }

  cleanup(): void {
    fnConsoleLog('cleanup');
  }

  focus(): void {
    fnConsoleLog('focus');
  }

  isHidden(): boolean {
    return false;
  }

  resize(): void {
    fnConsoleLog('resize');
  }
}
