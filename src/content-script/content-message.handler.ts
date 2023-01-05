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
import { DocumentMediator } from './mediator/document.mediator';
import { HtmlObject } from '../common/model/html.model';
import { PinAddElementStore } from './store/pin-add-element.store';
import { PinFocusCommand } from './command/pin/pin-focus.command';
import { PinGetHrefCommand } from './command/pin/pin-get-href.command';
import { PinGetIdCommand } from './command/pin/pin-get-id.command';
import { PinNavigateCommand } from './command/pin/pin-navigate.command';
import { PinPopupInitData } from '../common/model/pin.model';
import { PinStore } from './store/pin.store';
import { PinVisibleCommand } from './command/pin/pin-visible.command';
import { RuntimeLoginRefreshCommand } from './command/runtime/runtime-login-refresh.command';
import { SettingsStore } from './store/settings.store';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { contentPinNewUrl } from '../common/fn/pin/content-pin-new-url';
import { fnConsoleLog } from '../common/fn/console.fn';

export class ContentMessageHandler {
  static start(): void {
    BrowserApi.runtime.onMessage.addListener(this.handleMessage);
    TinyEventDispatcher.addListener(BusMessageType.POPUP_OPEN, this.handlePopupOpen);
  }

  static cleanup(): void {
    BrowserApi.runtime.onMessage.removeListener(this.handleMessage);
  }

  private static handleMessage = async (
    msg: BusMessage<any>,
    runtime: BrowserGlobalSender,
    sendResponse: (response: BusMessage<undefined>) => void
  ): Promise<void> => {
    if (![BusMessageType.CONTENT_TIMEOUT, BusMessageType.CONTENT_TIMEOUT_SET].includes(msg.type)) {
      fnConsoleLog('content-script->msg', Date.now(), msg);
    }
    sendResponse({
      type: BusMessageType.CONTENT_ACK
    });
    switch (msg.type) {
      case BusMessageType.POPUP_PIN_START:
        DocumentMediator.startListeners();
        break;
      case BusMessageType.POPUP_PIN_STOP:
        DocumentMediator.stopListeners();
        break;
      case BusMessageType.CONTENT_PIN_NAVIGATE:
        new PinNavigateCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_PIN_FOCUS:
        new PinFocusCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_PIN_GET_HREF:
        await new PinGetHrefCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_PIN_REMOVE:
        PinStore.delByUid((msg.data as HtmlObject).uid);
        break;
      case BusMessageType.CONTENT_PIN_GET_ID:
        await new PinGetIdCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_PIN_VISIBLE:
        await new PinVisibleCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_LOGIN_REFRESH:
        await new RuntimeLoginRefreshCommand().execute();
        break;
      default:
        TinyEventDispatcher.dispatch(msg.type, msg.data);
        break;
    }
  };

  private static handlePopupOpen = async (): Promise<void> => {
    const url = contentPinNewUrl();
    const data: PinPopupInitData = {
      url,
      pageTitle: document.title,
      isAddingNote: PinAddElementStore.hasElement,
      isBookmarked: SettingsStore.isBookmarked
    };
    await BrowserApi.sendRuntimeMessage<PinPopupInitData>({ type: BusMessageType.POPUP_INIT, data });
  };
}
