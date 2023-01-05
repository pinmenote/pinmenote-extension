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
import { BrowserGlobalSender, BusMessage, BusMessageType } from '@common/model/bus.model';
import { fnBrowserApi, fnExtensionStartUrl } from '@common/service/browser.api.wrapper';
import { ActiveTabStore } from './store/active-tab.store';
import { LogManager } from '@common/popup/log.manager';
import { PinPopupInitData } from '@common/model/pin.model';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendTabMessage } from '@common/message/tab.message';

export class PopupMessageHandler {
  static init(): void {
    fnBrowserApi().runtime.onMessage.addListener(this.handleMessage);
    sendTabMessage<undefined>({
      type: BusMessageType.POPUP_OPEN
    })
      .then((ack: any) => {
        LogManager.log(`FIREFOX SENDS EMPTY ACK :/!!! ${JSON.stringify(ack)}`);
        // if (!ack) TinyEventDispatcher.dispatch(BusMessageType.POPUP_INIT, {});
        fnConsoleLog(ack);
      })
      .catch((e) => {
        fnConsoleLog(e);
      });
    this.popupInitListener();
  }

  private static popupInitListener(): void {
    TinyEventDispatcher.addListener<PinPopupInitData>(BusMessageType.POPUP_INIT, (event, key, value) => {
      LogManager.log(`${event} ${JSON.stringify(value || {})}`);
      if (value.url) LogManager.log(`${event} ${value.url.href}`);
      if (value.url?.href.startsWith(fnExtensionStartUrl())) {
        ActiveTabStore.updateState(true, true, value);
      } else if (value.url) {
        ActiveTabStore.updateState(false, false, value);
      } else {
        ActiveTabStore.updateState(true, false, value);
      }
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
    if (runtime.id !== fnBrowserApi().runtime.id) return;

    TinyEventDispatcher.dispatch(msg.type, msg.data);
  };
}
