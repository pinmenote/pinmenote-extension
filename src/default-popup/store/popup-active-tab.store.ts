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
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { ExtensionPopupInitData } from '../../common/model/obj-request.model';
import { LogManager } from '../../common/popup/log.manager';
import { ObjGetHrefCommand } from '../../common/command/obj/url/obj-get-href.command';
import { ObjGetOriginCommand } from '../../common/command/obj/url/obj-get-origin.command';
import { ObjUrlDto } from '../../common/model/obj/obj.dto';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { UrlFactory } from '../../common/factory/url.factory';

export class PopupActiveTabStore {
  private static urlValue?: ObjUrlDto;
  private static isError = false;
  private static extensionUrl = false;

  private static isAddingValue = false;

  private static hrefData: any[] = [];
  private static originData: any[] = [];

  static get isAdding(): boolean {
    return this.isAddingValue;
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

  static initUrlValue = async () => {
    const tab = await BrowserApi.activeTab();
    if (tab.url) {
      const url = new URL(tab.url);
      this.urlValue = {
        href: UrlFactory.normalizeHref(url.href),
        origin: UrlFactory.normalizeOrigin(url.origin),
        pathname: url.pathname,
        search: url.search
      };
      LogManager.log(`updateState URL : ${JSON.stringify(this.urlValue)}`);
      this.hrefData = await new ObjGetHrefCommand(this.urlValue).execute();
      this.originData = await new ObjGetOriginCommand(this.urlValue).execute();
      if (this.urlValue?.href.startsWith(BrowserApi.startUrl)) {
        this.extensionUrl = true;
        this.isError = true;
      } else if (this.urlValue?.href.startsWith(BrowserApi.disabledUrl)) {
        this.isError = true;
      }
      TinyDispatcher.dispatch<void>(BusMessageType.POP_UPDATE_URL);
    }
  };

  static updateState = (initData?: ExtensionPopupInitData) => {
    LogManager.log(`PopupActiveTabStore->INIT - ${JSON.stringify(initData || {})}`);
    if (initData?.isAdding) {
      this.isAddingValue = true;
      TinyDispatcher.dispatch<boolean>(BusMessageType.POP_IS_ADDING, this.isAddingValue);
    }
  };
}
