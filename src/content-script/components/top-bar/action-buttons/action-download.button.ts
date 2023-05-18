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
import { PinEditManager } from '../../pin-edit.manager';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class ActionDownloadButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private visible = false;
  private fillColor = '#000000';

  constructor(private edit: PinEditManager) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="${this.fillColor}" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
<g><rect fill="none" height="24" width="24"/></g><g><path d="M5,20h14v-2H5V20z M19,9h-4V3H9v6H5l7,7L19,9z"/>
</g></svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  cleanup() {
    this.el.removeEventListener('click', this.handleClick);
  }

  turnoff(): void {
    this.visible = false;
    this.fillColor = '#000000';
    (this.el.firstChild as HTMLElement).setAttribute('fill', this.fillColor);
  }

  private handleClick = () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.edit.startDownload();
      this.fillColor = '#ff0000';
    } else {
      this.edit.stopEdit();
      this.fillColor = '#000000';
    }
    (this.el.firstChild as HTMLElement).setAttribute('fill', this.fillColor);
  };
}
