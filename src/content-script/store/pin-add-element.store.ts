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
import { BorderStore } from './border.store';
import { CreatePinDataCommand } from '../command/pin/create-pin-data.command';
import { DocumentMediator } from '../mediator/document.mediator';
import { fnConsoleLog } from '@common/fn/console.fn';

export class PinAddElementStore {
  private static currentElement: HTMLElement | null = null;
  private static currentElementBorderStyle = '';
  private static currentElementBorderRadius = '';

  static get hasElement(): boolean {
    return !!this.currentElement;
  }

  static get borderStyle(): string {
    return this.currentElementBorderStyle;
  }

  static get borderRadius(): string {
    return this.currentElementBorderRadius;
  }

  static clearElement(): void {
    if (!this.currentElement) return;
    this.currentElement.removeEventListener('click', this.handleElementClick);
    this.currentElement.style.border = this.currentElementBorderStyle;
    this.currentElement.style.borderRadius = this.currentElementBorderRadius;
    this.currentElementBorderStyle = '';
    this.currentElementBorderRadius = '';
    this.currentElement = null;
  }

  static updateElement(element: HTMLElement): void {
    if (this.currentElement !== element) {
      this.currentElement = element;
      this.currentElement.addEventListener('click', this.handleElementClick);
      this.currentElementBorderStyle = this.currentElement.style.border;
      this.currentElementBorderRadius = this.currentElement.style.borderRadius;
      this.currentElement.style.border = BorderStore.borderStyle;
      this.currentElement.style.borderRadius = BorderStore.borderRadius;
    }
  }

  private static handleElementClick = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopImmediatePropagation();
    fnConsoleLog('CLick', event);
    if (this.currentElement) {
      const element = event.target as HTMLElement;
      this.currentElement.style.border = this.currentElementBorderStyle;
      this.currentElement.style.borderRadius = this.currentElementBorderRadius;
      await new CreatePinDataCommand(element, {
        x: event.offsetX,
        y: event.offsetY
      }).execute();
    }
    DocumentMediator.stopListeners();
  };
}
