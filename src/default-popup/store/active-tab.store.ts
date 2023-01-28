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
import { ObjDto, ObjUrlDto } from '../../common/model/obj.model';
import { ExtensionPopupInitData } from '../../common/model/obj-request.model';
import { LogManager } from '../../common/popup/log.manager';
import { ObjPagePinDto } from '../../common/model/obj-pin.model';

export class ActiveTabStore {
  private static urlValue?: ObjUrlDto;
  private static isError = false;
  private static extensionUrl = false;
  private static isAddingNoteValue = false;

  private static pageTitleValue = '';

  private static originPinsValue: ObjDto<ObjPagePinDto>[] = [];
  private static hrefPinsValue: ObjDto<ObjPagePinDto>[] = [];

  static get originPins(): ObjDto<ObjPagePinDto>[] {
    return this.originPinsValue;
  }

  static set originPins(value: ObjDto<ObjPagePinDto>[]) {
    this.originPinsValue = value;
  }

  static get hrefPins(): ObjDto<ObjPagePinDto>[] {
    return this.hrefPinsValue;
  }

  static set hrefPins(value: ObjDto<ObjPagePinDto>[]) {
    this.hrefPinsValue = value;
  }

  static get isAddingNote(): boolean {
    return this.isAddingNoteValue;
  }

  static get pageTitle(): string {
    return this.pageTitleValue;
  }

  static get url(): ObjUrlDto | undefined {
    return this.urlValue;
  }

  static get showErrorText(): boolean {
    return this.isError;
  }

  static get isExtension(): boolean {
    return this.extensionUrl;
  }

  static updateState(isError: boolean, extensionUrl: boolean, initData?: ExtensionPopupInitData) {
    LogManager.log(`isError ${isError.toString()}`);
    this.isError = isError;
    this.extensionUrl = extensionUrl;
    this.urlValue = initData?.url;
    this.isAddingNoteValue = initData?.isAddingNote || false;
    this.pageTitleValue = initData?.pageTitle || '';
  }
}
