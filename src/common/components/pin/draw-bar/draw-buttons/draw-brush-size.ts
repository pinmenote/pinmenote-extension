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
import { HtmlComponent } from '../../model/pin-view.model';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';

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
  'font-size': '14px'
};

export class DrawBrushSize implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;
  private readonly input: HTMLInputElement;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.input = model.doc.document.createElement('input');
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);

    this.input.type = 'number';
    this.el.appendChild(this.input);
    this.input.addEventListener('input', this.handleChange);
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

  handleChange = () => {
    this.model.draw.size = Math.floor(this.input.valueAsNumber);
  };

  cleanup() {
    this.input.removeEventListener('input', this.handleChange);
  }
}
