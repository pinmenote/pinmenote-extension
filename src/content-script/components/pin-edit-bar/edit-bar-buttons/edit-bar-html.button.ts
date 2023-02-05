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
import { PinComponent } from '../../pin.component';
import { applyStylesToElement } from '../../../../common/style.utils';

const elStyles = {
  'margin-right': '10px',
  'user-select': 'none',
  cursor: 'pointer'
};

export class EditBarHtmlButton implements HtmlComponent<HTMLElement> {
  private readonly el = document.createElement('div');

  private visible = false;
  private fillColor = '#000000';

  constructor(private parent: PinComponent) {}

  render(): HTMLElement {
    this.el.addEventListener('click', this.handleClick);
    this.el.innerText = 'html';
    this.el.style.color = this.fillColor;
    applyStylesToElement(this.el, elStyles);
    return this.el;
  }

  turnoff(): void {
    this.visible = false;
    this.fillColor = '#000000';
    this.el.style.color = this.fillColor;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.parent.htmlEditComponent.focusin();
      this.fillColor = '#ff0000';
    } else {
      this.parent.htmlEditComponent.focusout();
      this.fillColor = '#000000';
    }
    this.el.style.color = this.fillColor;
  };
}
