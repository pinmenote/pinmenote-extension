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
import { BookmarkGetCommand } from '../../common/command/bookmark/bookmark-get.command';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { ExtensionPopupInitData } from '../../common/model/obj-request.model';
import { LogManager } from '../../common/popup/log.manager';
import { ObjBookmarkDto } from '../../common/model/obj-bookmark.model';
import { ObjPagePinDto } from '../../common/model/obj-pin.model';
import { PinGetHrefCommand } from '../../common/command/pin/pin-get-href.command';
import { PinGetOriginCommand } from '../../common/command/pin/pin-get-origin.command';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { UrlFactory } from '../../common/factory/url.factory';

export class ActiveTabStore {
  private static urlValue?: ObjUrlDto;
  private static isError = false;
  private static extensionUrl = false;
  private static isAddingNoteValue = false;
  private static bookmarkValue?: ObjDto<ObjBookmarkDto>;

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

  static get url(): ObjUrlDto | undefined {
    return this.urlValue;
  }

  static get bookmark(): ObjDto<ObjBookmarkDto> | undefined {
    return this.bookmarkValue;
  }

  static get showErrorText(): boolean {
    return this.isError;
  }

  static get isExtension(): boolean {
    return this.extensionUrl;
  }

  static refreshBookmark = async () => {
    if (this.urlValue) {
      this.bookmarkValue = await new BookmarkGetCommand(this.urlValue).execute();
    }
  };

  static initUrlValue = async () => {
    const tab = await BrowserApi.activeTab();
    if (tab.url) {
      const url = new URL(tab.url);
      this.urlValue = {
        href: UrlFactory.normalizeHref(tab.url),
        origin: UrlFactory.normalizeOrigin(url.origin),
        pathname: url.pathname,
        search: url.search
      };
      LogManager.log(`updateState URL : ${JSON.stringify(this.urlValue)}`);
      ActiveTabStore.hrefPins = await new PinGetHrefCommand(this.urlValue).execute();
      ActiveTabStore.originPins = await new PinGetOriginCommand(this.urlValue).execute();
      this.bookmarkValue = await new BookmarkGetCommand(this.urlValue).execute();
      TinyEventDispatcher.dispatch<void>(BusMessageType.POP_UPDATE_URL);
    }
  };

  static updateState = (isError: boolean, extensionUrl: boolean, initData?: ExtensionPopupInitData) => {
    this.isError = isError;
    this.extensionUrl = extensionUrl;
    this.isAddingNoteValue = initData?.isAddingNote || false;
  };
}
