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
import { BrowserGlobalSender, BusMessage, BusMessageType } from '../common/model/bus.model';
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { ExtensionPopupInitData } from '../common/model/obj-request.model';
import { PopupActiveTabStore } from './store/popup-active-tab.store';
import { PopupTokenStore } from './store/popup-token.store';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';

export class PopupMessageHandler {
  static async init(): Promise<void> {
    BrowserApi.runtime.onMessage.addListener(this.handleMessage);

    await PopupActiveTabStore.initUrlValue();

    await PopupTokenStore.init();

    this.popupInitListener();

    await BrowserApi.sendTabMessage({ type: BusMessageType.POPUP_OPEN });
  }

  private static popupInitListener(): void {
    TinyEventDispatcher.addListener<ExtensionPopupInitData>(BusMessageType.POPUP_INIT, (event, key, value) => {
      PopupActiveTabStore.updateState(value);
    });
  }

  private static handleMessage = <T>(
    msg: BusMessage<T>,
    runtime: BrowserGlobalSender,
    sendResponse: (response: any) => void
  ): void => {
    sendResponse({
      type: BusMessageType.POPUP_ACK
    });
    // Skip not owned messages
    if (runtime.id !== BrowserApi.runtime.id) return;

    TinyEventDispatcher.dispatch(msg.type, msg.data);
  };
}
