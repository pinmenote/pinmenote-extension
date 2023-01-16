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
import { HtmlComponent } from '../../../../common/model/html.model';
import { applyStylesToElement } from '../../../../common/style.utils';

const elStyles = {
  width: '75px',
  height: '25px',
  display: 'none',
  left: '90px',
  position: 'absolute'
};

const inputStyles = {
  width: '75px',
  height: '25px',
  outline: 'none',
  border: '2px solid #000000',
  'background-color': '#ffffff',
  color: '#000000',
  'font-size': '1em'
};

export class DrawBrushSize implements HtmlComponent<HTMLElement> {
  private readonly el = document.createElement('div');

  private input = document.createElement('input');

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);

    this.input.type = 'number';
    this.el.appendChild(this.input);
    applyStylesToElement(this.input, inputStyles);
    return this.el;
  }

  show(): void {
    this.el.style.top = '0px';
    this.el.style.display = 'inline-block';
    this.input.focus();
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  setSize(value: number) {
    this.input.value = `${value}`;
  }

  value(): number {
    return Math.floor(this.input.valueAsNumber);
  }

  /* eslint-disable @typescript-eslint/no-empty-function*/
  cleanup() {}
}
