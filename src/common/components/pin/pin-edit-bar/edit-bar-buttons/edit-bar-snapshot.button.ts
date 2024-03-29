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
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class EditBarSnapshotButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  constructor(model: PinEditModel, private editCallback: () => void) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#777777" height="24" viewBox="0 0 24 24" width="24">
      <g>
        <path
          d="M20,4H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z
    M20,18l-3.5,0V9H20V18z"
        />
      </g>
    </svg>`;
    this.el.setAttribute('title', 'Convert to Page Fragment');

    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, iconButtonStyles);

    this.el.style.marginRight = '5px';

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = () => {
    this.el.removeEventListener('click', this.handleClick);
    this.editCallback();
  };
}
