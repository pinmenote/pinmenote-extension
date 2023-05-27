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
import { HtmlComponent } from '../../../model/html.model';
import { PinModel } from '../../pin.model';
import { PinUpdateCommand } from '../../../../common/command/pin/pin-update.command';
import { XpathFactory } from '../../../../common/factory/xpath.factory';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class EditBarParentButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  constructor(private model: PinModel, private resizeCallback: () => void) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24">
    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
  </svg>`;
    this.el.setAttribute('title', 'Expand to parent');

    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, iconButtonStyles);

    this.el.style.marginRight = '5px';

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = async (): Promise<void> => {
    if (this.model.ref.parentElement?.tagName === 'BODY') {
      fnConsoleLog(`No parent for node ${this.model.id}`);
      return;
    }
    if (this.model.ref.parentElement) {
      this.model.ref = this.model.ref.parentElement;

      this.model.object.data.xpath = XpathFactory.newXPathString(this.model.ref);

      await new PinUpdateCommand(this.model.object).execute();
      this.resizeCallback();
    }
  };
}
