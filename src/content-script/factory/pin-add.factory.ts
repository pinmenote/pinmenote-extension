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
import { PinBorderDataDto } from '../../common/model/obj/obj-pin.dto';

export class PinAddFactory {
  static readonly bgColor = '#faeaea';
  static currentElement?: HTMLElement;
  private static borderStyle = '';
  private static borderRadius = '';
  private static backgroundColor = '';

  static startPoint?: ObjPointDto;

  static get border(): PinBorderDataDto {
    return {
      radius: this.borderRadius,
      style: this.borderStyle
    };
  }

  static get isCanvas(): boolean {
    return (
      this.currentElement instanceof HTMLCanvasElement ||
      this.currentElement instanceof HTMLImageElement ||
      this.currentElement instanceof HTMLVideoElement
    );
  }

  static get element(): HTMLElement | undefined {
    return this.currentElement;
  }

  static clearStyles(): void {
    if (!this.currentElement) return;
    this.currentElement.style.backgroundColor = this.backgroundColor;
    this.currentElement.style.border = this.borderStyle;
    this.currentElement.style.borderRadius = this.borderRadius;
  }

  static hasStyles(): boolean {
    if (!this.currentElement) return false;
    return (
      this.currentElement.style.backgroundColor === this.bgColor ||
      this.currentElement.style.border === ContentSettingsStore.newElementStyle
    );
  }

  static clear(): void {
    if (!this.currentElement) return;
    this.currentElement.style.border = this.borderStyle;
    this.currentElement.style.borderRadius = this.borderRadius;
    this.currentElement.style.backgroundColor = this.backgroundColor;
    this.borderStyle = '';
    this.borderRadius = '';
    this.backgroundColor = '';
    this.currentElement = undefined;
    this.startPoint = undefined;
  }

  static updateElement(element: HTMLElement): void {
    if (this.currentElement !== element) {
      this.currentElement = element;
      this.borderStyle = this.currentElement.style.border;
      this.borderRadius = this.currentElement.style.borderRadius;
      this.backgroundColor = this.currentElement.style.backgroundColor;
      this.currentElement.style.border = ContentSettingsStore.newElementStyle;
      this.currentElement.style.borderRadius = ContentSettingsStore.borderRadius;
      this.currentElement.style.backgroundColor = this.bgColor;
    }
  }
}
