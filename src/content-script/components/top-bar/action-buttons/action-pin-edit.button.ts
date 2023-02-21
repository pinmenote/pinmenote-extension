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
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { PinComponent } from '../../pin.component';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class ActionPinEditButton implements HtmlComponent<HTMLElement> {
  private readonly el = document.createElement('div');

  private visible = false;
  private fillColor = '#000000';

  constructor(private parent: PinComponent, private object: ObjDto) {}

  render() {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="${this.fillColor}" height="24" viewBox="0 0 24 24" width="24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
</svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);
    return this.el;
  }

  cleanup() {
    this.el.removeEventListener('click', this.handleClick);
  }

  turnoff = (): void => {
    this.visible = false;
    this.fillColor = '#000000';
    (this.el.firstChild as HTMLElement).setAttribute('fill', this.fillColor);
  };

  private handleClick = () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.parent.edit.startPinEdit();
      this.fillColor = '#ff0000';
    } else {
      this.parent.edit.stopEdit();
      this.fillColor = '#000000';
    }
    (this.el.firstChild as HTMLElement).setAttribute('fill', this.fillColor);
  };
}
