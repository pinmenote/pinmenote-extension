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
import { HtmlComponent } from '../../../model/pin-view.model';
import { PinEditManager } from '../../../pin-edit.manager';
import { PinEditModel } from '../../../model/pin-edit.model';
import { PinUpdateCommand } from '../../../../../command/pin/pin-update.command';
import { applyStylesToElement } from '../../../../../style.utils';
import { iconButtonStyles } from '../../../styles/icon-button.styles';

export class ActionDrawVisibleButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private fillColor: string;

  constructor(private edit: PinEditManager, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.fillColor = model.local.drawVisible ? '#ff0000' : '#000000';
  }

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="${this.fillColor}" height="24" viewBox="0 0 24 24" width="24">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
</svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);
    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  show(): void {
    this.el.style.display = 'inline-block';
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  handleClick = async () => {
    if (this.model.local.drawVisible) {
      this.fillColor = '#000000';
      this.model.local.drawVisible = false;
      this.edit.hideDraw();
    } else {
      this.fillColor = '#ff0000';
      this.model.local.drawVisible = true;
      this.edit.showDraw();
    }
    (this.el.firstChild as HTMLElement).setAttribute('fill', this.fillColor);
    await new PinUpdateCommand(this.model.object).execute();
  };
}
