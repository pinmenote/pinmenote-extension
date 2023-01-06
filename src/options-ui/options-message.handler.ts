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
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { LogManager } from '../common/popup/log.manager';
import { PinPopupInitData } from '../common/model/pin.model';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { contentPinNewUrl } from '../common/fn/pin/content-pin-new-url';
import { fnConsoleLog } from '../common/fn/console.fn';

export class OptionsMessageHandler {
  static init(): void {
    BrowserApi.runtime.onMessage.addListener(this.handleRemoteMessage);
    TinyEventDispatcher.addListener(BusMessageType.POPUP_OPEN, this.handlePopupOpen);
  }

  private static handleRemoteMessage = (
    msg: BusMessage<any>,
    runtime: BrowserGlobalSender,
    sendResponse: (response: BusMessage<any>) => void
  ): void => {
    fnConsoleLog('OptionsMessageManager->msg', msg);
    sendResponse({
      type: BusMessageType.CONTENT_ACK
    });
    TinyEventDispatcher.dispatch(msg.type, msg.data);
  };

  private static handlePopupOpen = async (): Promise<void> => {
    const url = contentPinNewUrl();
    const data: PinPopupInitData = { url, isAddingNote: false, isBookmarked: false, pageTitle: document.title };
    LogManager.log(`handlePopupOpen->${JSON.stringify(data)}`);
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_INIT, data });
  };
}
