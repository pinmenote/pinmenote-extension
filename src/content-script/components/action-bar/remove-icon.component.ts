/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { BusMessageType } from '@common/model/bus.model';
import { PinObject } from '@common/model/pin.model';
import { applyStylesToElement } from '@common/style.utils';
import { iconButtonStyles } from '../styles/icon-button.styles';
import { sendRuntimeMessage } from '@common/message/runtime.message';

export class RemoveIconComponent {
  private el = document.createElement('div');
  constructor(private pin: PinObject) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 0 24 24" width="12">    
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
    this.el.removeEventListener('click', this.handleClick);
    await sendRuntimeMessage<PinObject>({ type: BusMessageType.CONTENT_PIN_REMOVE, data: this.pin });
  };
}
