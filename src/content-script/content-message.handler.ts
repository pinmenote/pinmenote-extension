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
import { ContentPageSnapshotAddCommand } from './command/snapshot/content-page-snapshot-add.command';
import { DocumentMediator } from './mediator/document.mediator';
import { ExtensionPopupInitData } from '../common/model/obj-request.model';
import { IframeMediator } from './mediator/iframe.mediator';
import { PinAddFactory } from './factory/pin-add.factory';
import { PinNavigateCommand } from './command/pin/pin-navigate.command';
import { PinStore } from './store/pin.store';
import { PinVisibleCommand } from './command/pin/pin-visible.command';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../common/fn/console.fn';

export class ContentMessageHandler {
  private static href?: string;
  private static iframe = false;

  static start(href: string, iframe = false): void {
    this.href = href;
    this.iframe = iframe;
    BrowserApi.runtime.onMessage.addListener(this.handleMessage);
    TinyEventDispatcher.addListener(BusMessageType.POPUP_OPEN, this.handlePopupOpen);
  }

  static updateHref(href: string): void {
    this.href = href;
  }

  static cleanup(): void {
    try {
      BrowserApi.runtime.onMessage.removeListener(this.handleMessage);
    } catch (e) {
      fnConsoleLog('ContentMessageHandler->cleanup->error', e);
    }
  }

  private static handleMessage = async (
    msg: BusMessage<any>,
    runtime: BrowserGlobalSender,
    sendResponse: (response: BusMessage<undefined>) => void
  ): Promise<void> => {
    // fnConsoleLog('ContentMessageHandler->handleMessage', this.href, msg);
    sendResponse({
      type: BusMessageType.CONTENT_ACK
    });
    switch (msg.type) {
      case BusMessageType.POPUP_PAGE_SNAPSHOT_ADD:
        if (!this.iframe) await new ContentPageSnapshotAddCommand(msg.data).execute();
        break;
      case BusMessageType.POPUP_CAPTURE_ELEMENT_START:
      case BusMessageType.POPUP_PIN_START:
        if (this.href !== msg.data.url.href) {
          // fnConsoleLog('SKIP', href);
          return;
        }
        fnConsoleLog('DocumentMediator->startListeners', this.href);
        DocumentMediator.startListeners(msg.data.type);
        break;
      case BusMessageType.POPUP_CAPTURE_ELEMENT_STOP:
      case BusMessageType.CONTENT_PIN_STOP:
      case BusMessageType.POPUP_PIN_STOP:
        DocumentMediator.stopListeners();
        break;
      case BusMessageType.CONTENT_PIN_NAVIGATE:
        new PinNavigateCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_PIN_REMOVE:
        PinStore.delByUid(msg.data);
        break;
      case BusMessageType.CONTENT_PIN_VISIBLE:
        new PinVisibleCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_IFRAME_MESSAGE:
        IframeMediator.resolveIframeMessage(msg.data);
        break;
      default:
        TinyEventDispatcher.dispatch(msg.type, msg.data);
        break;
    }
  };

  private static handlePopupOpen = async (): Promise<void> => {
    const data: ExtensionPopupInitData = {
      isAdding: !!PinAddFactory.currentElement
    };
    fnConsoleLog('ContentMessageHandler->handlePopupOpen', data);
    await BrowserApi.sendRuntimeMessage<ExtensionPopupInitData>({ type: BusMessageType.POPUP_INIT, data });
  };
}
