/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 202 Michal Szczepanski.
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
import { ObjPointDto } from '../../common/model/obj/obj-utils.dto';

export class PinAddFactory {
  private static currentElement?: HTMLElement;
  private static borderStyle = '';
  private static borderRadius = '';

  static startPoint?: ObjPointDto;

  static get hasElement(): boolean {
    return !!this.currentElement;
  }

  static get isCanvas(): boolean {
    return this.currentElement instanceof HTMLCanvasElement;
  }

  static get element(): HTMLElement | undefined {
    return this.currentElement;
  }

  static clear(): void {
    if (!this.currentElement) return;
    this.currentElement.style.border = this.borderStyle;
    this.currentElement.style.borderRadius = this.borderRadius;
    this.borderStyle = '';
    this.borderRadius = '';
    this.currentElement = undefined;
    this.startPoint = undefined;
  }

  static updateElement(element: HTMLElement): void {
    if (this.currentElement !== element) {
      this.currentElement = element;
      this.borderStyle = this.currentElement.style.border;
      this.borderRadius = this.currentElement.style.borderRadius;
      this.currentElement.style.border = ContentSettingsStore.newElementStyle;
      this.currentElement.style.borderRadius = ContentSettingsStore.borderRadius;
    }
  }
}
