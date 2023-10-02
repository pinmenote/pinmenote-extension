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
import { ContentPageSnapshotAddCommand } from './command/snapshot/content-page-snapshot-add.command';
import { ContentSettingsStore } from './store/content-settings.store';
import { DocumentMediator } from './mediator/document.mediator';
import { ExtensionPopupInitData } from '../common/model/obj-request.model';
import { IFrameMessageHandler } from './iframe-message.handler';
import { PageComputeMessage } from '@pinmenote/page-compute';
import { PinAddFactory } from './factory/pin-add.factory';
import { PinNavigateCommand } from './command/pin/pin-navigate.command';
import { PinPendingStore } from './store/pin-pending.store';
import { PinStore } from './store/pin.store';
import { PinVisibleCommand } from './command/pin/pin-visible.command';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../common/fn/fn-console';
import { ContentPdfSaveCommand } from './command/snapshot/content-pdf-save.command';
import { fnIsPdf } from '../common/fn/fn-is-pdf';

export class ContentMessageHandler {
  private static href?: string;
  private static uid: string;

  static start(href: string, uid = ''): void {
    this.href = href;
    this.uid = uid;
    BrowserApi.runtime.onMessage.addListener(this.handleMessage);
    TinyDispatcher.getInstance().addListener(BusMessageType.POPUP_OPEN, this.handlePopupOpen);
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
    // fnConsoleLog('ContentMessageHandler->handleMessage', this.href, msg, this.iframe);
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
        await IFrameMessageHandler.handleMessage(msg, false, this.uid, this.href);
        break;
      case BusMessageType.POPUP_PAGE_SNAPSHOT_ADD:
        await new ContentPageSnapshotAddCommand(ContentSettingsStore.settings, msg.data).execute();
        break;
      case BusMessageType.POPUP_SAVE_PDF:
        await new ContentPdfSaveCommand(msg.data).execute();
        await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_SNAPSHOT_ADD });
        break;
      case BusMessageType.POPUP_CAPTURE_ELEMENT_START:
      case BusMessageType.POPUP_PAGE_ALTER_START:
      case BusMessageType.POPUP_PIN_START:
        if (this.href !== msg.data.url.href) {
          // fnConsoleLog('SKIP', href);
          return;
        }
        fnConsoleLog('DocumentMediator->startListeners', this.href, msg.data.url);
        DocumentMediator.startListeners(msg.data.type, msg.data.url, false);
        break;
      case BusMessageType.POPUP_IS_PDF: {
        await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_IS_PDF, data: fnIsPdf() });
        break;
      }
      case BusMessageType.CONTENT_STOP_LISTENERS:
        DocumentMediator.stopListeners();
        break;
      case BusMessageType.CONTENT_PIN_NAVIGATE:
        new PinNavigateCommand(msg.data).execute();
        break;
      case BusMessageType.CONTENT_PIN_REMOVE:
        PinStore.delByUid(msg.data);
        PinPendingStore.remove(msg.data);
        break;
      case BusMessageType.CONTENT_PIN_VISIBLE:
        new PinVisibleCommand(msg.data).execute();
        break;
      default:
        TinyDispatcher.getInstance().dispatch(msg.type, msg.data);
        break;
    }
  };

  private static handlePopupOpen = async (): Promise<void> => {
    const data: ExtensionPopupInitData = {
      isAdding: !!PinAddFactory.currentElement
    };
    fnConsoleLog('ContentMessageHandler->handlePopupOpen', data);
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_INDEX_REGISTER });
    await BrowserApi.sendRuntimeMessage<ExtensionPopupInitData>({ type: BusMessageType.POPUP_INIT, data });
  };
}
