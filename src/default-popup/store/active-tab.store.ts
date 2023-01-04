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
import PinUrl = Pinmenote.Pin.PinUrl;
import { PinObject, PinPopupInitData } from '@common/model/pin.model';

export class ActiveTabStore {
  private static urlValue?: PinUrl;
  private static isError = false;
  private static extensionUrl = false;
  private static isAddingNoteValue = false;

  private static isBookmarkedValue = false;
  private static pageTitleValue = '';

  private static originPinsValue: PinObject[] = [];
  private static hrefPinsValue: PinObject[] = [];

  static get originPins(): PinObject[] {
    return this.originPinsValue;
  }

  static set originPins(value: PinObject[]) {
    this.originPinsValue = value;
  }

  static get hrefPins(): PinObject[] {
    return this.hrefPinsValue;
  }

  static set hrefPins(value: PinObject[]) {
    this.hrefPinsValue = value;
  }

  static get isAddingNote(): boolean {
    return this.isAddingNoteValue;
  }

  static get isBookmarked(): boolean {
    return this.isBookmarkedValue;
  }

  static get pageTitle(): string {
    return this.pageTitleValue;
  }

  static get url(): PinUrl | undefined {
    return this.urlValue;
  }

  static get showErrorText(): boolean {
    return this.isError;
  }

  static get isExtension(): boolean {
    return this.extensionUrl;
  }

  static updateState(isError: boolean, extensionUrl: boolean, initData?: PinPopupInitData) {
    this.isError = isError;
    this.extensionUrl = extensionUrl;
    this.urlValue = initData?.url;
    this.isAddingNoteValue = initData?.isAddingNote || false;
    this.isBookmarkedValue = initData?.isBookmarked || false;
    this.pageTitleValue = initData?.pageTitle || '';
  }
}
