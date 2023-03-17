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
  color: '#000000',
  'font-size': '0.8em',
  'text-decoration': 'underline',
  cursor: 'pointer'
};

export class AddCommentButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private visible = false;

  constructor(private parent: PinComponent) {}

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  get isVisible(): boolean {
    return this.visible;
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);
    this.el.innerText = 'add comment';
    this.el.addEventListener('click', this.handleClick);
    return this.el;
  }

  private handleClick = () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.parent.edit.showText();
    } else {
      this.parent.edit.hideText();
    }
  };
}
