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
import { BrowserGlobalSender, BusMessage, BusMessageType } from '../common/model/bus.model';
import { ActiveTabStore } from './store/active-tab.store';
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../common/service/browser.storage.wrapper';
import { LogManager } from '../common/popup/log.manager';
import { ObjectStoreKeys } from '../common/keys/object.store.keys';
import { PinPopupInitData } from '../common/model/pin.model';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../common/fn/console.fn';

export class PopupMessageHandler {
  static init(): void {
    BrowserApi.runtime.onMessage.addListener(this.handleMessage);
    BrowserApi.sendTabMessage<undefined>({
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
    TinyEventDispatcher.addListener<PinPopupInitData>(BusMessageType.POPUP_INIT, async (event, key, value) => {
      const lastId = await BrowserStorageWrapper.get(ObjectStoreKeys.OBJECT_LAST_ID);
      LogManager.log(`popupInitListener->LAST ID !!! ${JSON.stringify(lastId)}`);
      LogManager.log(`${event} ${JSON.stringify(value || {})}`);
      if (value.url) LogManager.log(`${event} ${value.url.href}`);
      if (value.url?.href.startsWith(BrowserApi.startUrl)) {
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
    if (runtime.id !== BrowserApi.runtime.id) return;

    TinyEventDispatcher.dispatch(msg.type, msg.data);
  };
}
