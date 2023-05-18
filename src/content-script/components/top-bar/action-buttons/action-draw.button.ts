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
import { PinModel } from '../../pin.model';
import { PinUpdateCommand } from '../../../../common/command/pin/pin-update.command';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class ActionDrawButton implements HtmlComponent<HTMLElement> {
  private readonly el = document.createElement('div');

  private visible = false;

  private fillColor = '#000000';

  constructor(private edit: PinEditManager, private model: PinModel) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="${this.fillColor}" height="24" viewBox="0 0 24 24" width="24">
        <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
    </svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);
    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  turnoff(): void {
    this.visible = false;
    this.fillColor = '#000000';
    (this.el.firstChild as HTMLElement).setAttribute('fill', this.fillColor);
  }

  handleClick = async () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.edit.startDraw();
      this.model.local.drawVisible = true;
      this.fillColor = '#ff0000';
    } else {
      this.edit.stopDraw();
      this.fillColor = '#000000';
      this.model.local.drawVisible = false;
    }
    (this.el.firstChild as HTMLElement).setAttribute('fill', this.fillColor);
    await new PinUpdateCommand(this.model.object).execute();
  };
}
