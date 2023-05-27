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
import { PinEditManager } from '../../pin-edit.manager';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';

const elStyles = {
  color: '#000000',
  'margin-right': '5px',
  'font-size': '0.8em',
  'text-decoration': 'underline',
  'user-select': 'none',
  cursor: 'pointer'
};

export class ShowCommentButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private visible = false;

  constructor(private edit: PinEditManager, model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  get isVisible(): boolean {
    return this.visible;
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);
    this.el.innerText = 'show comments';
    this.el.addEventListener('click', this.handleClick);
    return this.el;
  }

  private handleClick = () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.edit.showText();
      this.el.innerText = 'hide comments';
    } else {
      this.edit.hideText();
      this.el.innerText = 'show comments';
    }
  };
}
