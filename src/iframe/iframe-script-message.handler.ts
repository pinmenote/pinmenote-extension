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
import { BrowserApi, BrowserGlobalSender, BusMessage } from '@pinmenote/browser-api';
import { BusMessageType } from '../common/model/bus.model';
import { IFrameMessageHandler } from '../content-script/iframe-message.handler';
import { PageComputeMessage } from '@pinmenote/page-compute';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../common/fn/fn-console';

export class IframeScriptMessageHandler {
  private static href?: string;
  private static uid: string;

  static start(href: string, uid = ''): void {
    this.href = href;
    this.uid = uid;
    BrowserApi.runtime.onMessage.addListener(this.handleMessage);
  }

  static cleanup(): void {
    try {
      BrowserApi.runtime.onMessage.removeListener(this.handleMessage);
    } catch (e) {
      fnConsoleLog('IframeScriptMessageHandler->cleanup->error', e);
    }
  }

  private static handleMessage = async (
    msg: BusMessage<any>,
    runtime: BrowserGlobalSender,
    sendResponse: (response: BusMessage<undefined>) => void
  ): Promise<void> => {
    // fnConsoleLog('IframeScriptMessageHandler->handleMessage', this.href, msg);
    sendResponse({
      type: BusMessageType.CONTENT_ACK
    });
    switch (msg.type) {
      case BusMessageType.IFRAME_INDEX:
      case BusMessageType.IFRAME_INDEX_REGISTER:
      case BusMessageType.IFRAME_PIN_SEND:
      case BusMessageType.IFRAME_PIN_SHOW:
      case BusMessageType.IFRAME_START_LISTENERS:
      case BusMessageType.IFRAME_START_LISTENERS_RESULT:
      case BusMessageType.IFRAME_STOP_LISTENERS:
      case BusMessageType.IFRAME_MOUSE_OUT:
      case PageComputeMessage.IFRAME_FETCH:
        await IFrameMessageHandler.handleMessage(msg, true, this.uid, this.href);
        break;
      default:
        TinyDispatcher.getInstance().dispatch(msg.type, msg.data);
        break;
    }
  };
}
