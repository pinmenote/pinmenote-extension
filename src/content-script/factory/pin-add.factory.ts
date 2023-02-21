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
import { ContentSettingsStore } from '../store/content-settings.store';
import { DocumentMediator } from '../mediator/document.mediator';
import { PinAddCommand } from '../../common/command/pin/pin-add.command';
import { PinComponentAddCommand } from '../command/pin/pin-component-add.command';
import { PinFactory } from './pin.factory';

export class PinAddFactory {
  private static currentElement: HTMLElement | null = null;
  private static borderStyle = '';
  private static borderRadius = '';

  static get hasElement(): boolean {
    return !!this.currentElement;
  }

  static clear(): void {
    if (!this.currentElement) return;
    this.currentElement?.removeEventListener('click', this.handleElementClick);
    this.currentElement.style.border = this.borderStyle;
    this.currentElement.style.borderRadius = this.borderRadius;
    this.borderStyle = '';
    this.borderRadius = '';
    this.currentElement = null;
  }

  static updateElement(element: HTMLElement): void {
    if (this.currentElement !== element) {
      this.currentElement?.removeEventListener('click', this.handleElementClick);
      this.currentElement = element;
      this.currentElement.addEventListener('click', this.handleElementClick);
      this.borderStyle = this.currentElement.style.border;
      this.borderRadius = this.currentElement.style.borderRadius;
      this.currentElement.style.border = ContentSettingsStore.newElementStyle;
      this.currentElement.style.borderRadius = ContentSettingsStore.borderRadius;
    }
  }

  private static handleElementClick = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const element = this.currentElement;
    DocumentMediator.stopListeners();
    if (element) {
      const pagePin = await PinFactory.objPagePinNew(element);
      const obj = await new PinAddCommand(pagePin).execute();
      new PinComponentAddCommand(element, obj, true).execute();
    }
  };
}
