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
import { CryptoDecryptCommand } from '../../../../common/command/crypto/crypto-decrypt.command';
import { HtmlComponent } from '../../../../common/model/html.model';
import { PinComponent } from '../../pin.component';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnConsoleLog } from '../../../../common/fn/console.fn';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class EditBarDecryptButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  constructor(private parent: PinComponent) {}

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000" height="24" viewBox="0 0 24 24" width="24">
        <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
</svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  private handleClick = async () => {
    fnConsoleLog('DECRYPT !!!!');
    const result = await new CryptoDecryptCommand(this.parent.ref.innerText, false).execute();
    fnConsoleLog('DECRYPT RESULT', result);
    if (!result) return;
    this.parent.ref.innerText = result;
  };
}
