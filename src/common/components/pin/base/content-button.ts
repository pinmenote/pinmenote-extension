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
import { PinDocument } from '../model/pin-view.model';
import { applyStylesToElement } from '../../../style.utils';

const elStyles = {
  'background-color': '#ffffff',
  color: '#000000',
  border: 'none',
  margin: '2px',
  padding: '2px',
  display: 'inline-block'
};

export class ContentButton {
  private readonly btn: HTMLButtonElement;
  constructor(private doc: PinDocument, private html: string, private clickCallback: () => void) {
    this.btn = doc.document.createElement('button');
    this.btn.innerHTML = html;
    this.btn.addEventListener('click', clickCallback);
  }

  render(): HTMLElement {
    applyStylesToElement(this.btn, elStyles);
    return this.btn;
  }
}
