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
import { CreatePinDataCommand } from '../command/pin/create-pin-data.command';
import { DocumentMediator } from '../mediator/document.mediator';
import { SettingsStore } from './settings.store';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class PinAddElementStore {
  private static currentElement: HTMLElement | null = null;
  private static borderStyle = '';
  private static borderRadius = '';

  static get hasElement(): boolean {
    return !!this.currentElement;
  }

  static clearElement(): void {
    if (!this.currentElement) return;
    this.currentElement.style.border = this.borderStyle;
    this.currentElement.style.borderRadius = this.borderRadius;
    this.borderStyle = '';
    this.borderRadius = '';
    this.currentElement = null;
  }

  static updateElement(element: HTMLElement): void {
    if (this.currentElement !== element) {
      this.currentElement = element;
      this.currentElement.addEventListener('click', this.handleElementClick);
      this.borderStyle = this.currentElement.style.border;
      this.borderRadius = this.currentElement.style.borderRadius;
      this.currentElement.style.border = SettingsStore.borderStyle;
      this.currentElement.style.borderRadius = SettingsStore.borderRadius;
    }
  }

  private static handleElementClick = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopImmediatePropagation();
    fnConsoleLog('CLick', event);
    if (this.currentElement) {
      this.currentElement.style.border = this.borderStyle;
      this.currentElement.style.borderRadius = this.borderRadius;
      await new CreatePinDataCommand(this.currentElement).execute();
    }
    DocumentMediator.stopListeners();
  };
}
