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
import { BrowserApi, BusMessage } from '@pinmenote/browser-api';
import { BusMessageType } from '../common/model/bus.model';
import { ContentFetchIframeCommand } from './command/snapshot/content-fetch-iframe.command';
import { DocumentMediator } from './mediator/document.mediator';
import { IFrameIndexMessage } from '../common/model/iframe-message.model';
import { IFrameStore } from './store/iframe.store';
import { PinAddIframeXpathCommand } from './command/pin/pin-add-iframe-xpath.command';
import { PinPendingStore } from './store/pin-pending.store';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../common/fn/fn-console';
import { fnIframeIndex } from '../common/fn/fn-iframe-index';

export class IFrameMessageHandler {
  static handleMessage = async (msg: BusMessage<any>, iframe: boolean, uid: string, href?: string): Promise<void> => {
    switch (msg.type) {
      case BusMessageType.IFRAME_INDEX: {
        if (msg.data.uid !== uid) IFrameStore.getInstance().registerIframe(msg.data as IFrameIndexMessage, uid);
        break;
      }
      case BusMessageType.IFRAME_INDEX_REGISTER: {
        const index = fnIframeIndex();
        await BrowserApi.sendRuntimeMessage<IFrameIndexMessage>({
          type: BusMessageType.IFRAME_INDEX,
          data: { index, uid }
        });
        fnConsoleLog('IframeScript->sendIframeIndex', uid, index, window.document);
        break;
      }
      case BusMessageType.IFRAME_FETCH: {
        if (iframe && msg.data.uid === uid && href) {
          await new ContentFetchIframeCommand(href, uid, msg.data.depth).execute();
        } else {
          TinyDispatcher.dispatch(msg.type, msg.data);
        }
        break;
      }
      case BusMessageType.IFRAME_STOP_LISTENERS: {
        if (iframe && msg.data.uid === uid) DocumentMediator.stopListeners();
        break;
      }
      case BusMessageType.IFRAME_START_LISTENERS: {
        if (iframe && msg.data.uid === uid) {
          await BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_START_LISTENERS_RESULT, data: msg.data });
          DocumentMediator.startListeners(msg.data.type, msg.data.url, true);
        }
        break;
      }
      case BusMessageType.IFRAME_MOUSE_OUT: {
        IFrameStore.resumeListeners(msg.data);
        break;
      }
      case BusMessageType.IFRAME_PING: {
        if (iframe && msg.data.uid === uid) {
          await BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_PING_RESULT, data: msg.data });
        }
        break;
      }
      case BusMessageType.IFRAME_PIN_SEND: {
        const index = fnIframeIndex();
        if (msg.data.data.data.iframe && index === msg.data.data.data.iframe.index) {
          const added = new PinAddIframeXpathCommand(msg.data).execute();
          fnConsoleLog('IFRAME_PIN_SEND', msg, added);
          if (added) await BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_PIN_SHOW, data: msg.data });
        }
        break;
      }
      case BusMessageType.IFRAME_PIN_SHOW: {
        if (!iframe) PinPendingStore.remove(msg.data.id);
        break;
      }
      default:
        TinyDispatcher.dispatch(msg.type, msg.data);
        break;
    }
  };
}
