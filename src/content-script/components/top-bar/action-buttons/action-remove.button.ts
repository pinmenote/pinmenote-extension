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
import { PinRemoveCommand } from '../../../../common/command/pin/pin-remove.command';
import { PinStore } from '../../../store/pin.store';
import { SettingsStore } from '../../../../options-ui/store/settings.store';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class ActionRemoveButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');
  constructor(private parent: PinComponent) {}

  render(): HTMLElement {
    const fillColor = SettingsStore.settings?.themeColor || '#ff0000';
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="${fillColor}" height="24" viewBox="0 0 24 24" width="24">    
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);
    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = async () => {
    this.parent.htmlEditComponent.rollback();
    this.el.removeEventListener('click', this.handleClick);
    await new PinRemoveCommand(this.parent.object).execute();
    PinStore.delByUid(this.parent.object.id);
  };
}
