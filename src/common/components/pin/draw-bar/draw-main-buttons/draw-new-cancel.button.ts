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

export class DrawNewCancelButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;
  constructor(private edit: PinEditManager, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    this.el.innerText = 'Cancel';
    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, {
      cursor: 'pointer',
      color: '#000',
      'font-size': '1em',
      'font-weight': 'bold',
      'margin-left': '10px'
    });
    return this.el;
  }

  handleClick = () => {
    this.edit.cancelDraw();
    this.model.topBar.drawTurnoff();
  };

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }
}
