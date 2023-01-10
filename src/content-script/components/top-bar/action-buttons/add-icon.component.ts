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
import { fnConsoleLog } from '../../../../common/fn/console.fn';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class AddIconComponent implements HtmlComponent {
  private el = document.createElement('div');

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  private handleClick = () => {
    fnConsoleLog('add click');
  };
}
