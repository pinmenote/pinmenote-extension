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
import { IFrameMessage, IFrameMessageType } from '../common/model/iframe-message.model';
import { fnConsoleError, fnConsoleLog } from '../common/fn/console.fn';
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../common/service/browser.storage.wrapper';
import { BusMessageType } from '../common/model/bus.model';
import { ContentFetchIframeCommand } from '../content-script/command/snapshot/content-fetch-iframe.command';
import { ContentMessageHandler } from '../content-script/content-message.handler';
import { ContentSettingsStore } from '../content-script/store/content-settings.store';
import { DocumentMediator } from '../content-script/mediator/document.mediator';
import { IFrameMessageFactory } from '../content-script/factory/html/iframe-message.factory';
import { ObjTypeDto } from '../common/model/obj/obj.dto';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { UrlFactory } from '../common/factory/url.factory';
import { fnUid } from '../common/fn/uid.fn';

/**
 * IframeScript runs at document_idle -> all_frames
 * this prevents crashing extension on some web pages with infinite iframe loop (thank you fb)
 */
export class IframeScript {
  private readonly href: string;
  private timeoutId = 0;
  private type?: ObjTypeDto;
  private uid?: string;

  constructor(private readonly id: string, private ms: number) {
    this.href = UrlFactory.normalizeHref(window.location.href);
    window.addEventListener('message', this.handleIframeMessage);

    ContentMessageHandler.start(this.href);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    TinyEventDispatcher.addListener<number[]>(BusMessageType.CNT_SETTINGS, this.handlePinSettings);
    TinyEventDispatcher.dispatch(BusMessageType.CNT_SETTINGS, {});
  }

  private handlePinSettings = async (event: string, key: string): Promise<void> => {
    TinyEventDispatcher.removeListener(event, key);

    await ContentSettingsStore.initSettings();
  };

  private handleVisibilityChange = async (): Promise<void> => {
    fnConsoleLog('IframeScript->handleVisibilityChange', this.id);
    await this.invalidateContentScript();
  };

  private invalidateContentScript = async (): Promise<boolean> => {
    try {
      await BrowserStorageWrapper.get('foo');
      return true;
    } catch (e) {
      fnConsoleLog('IframeScript->Error', this.id, e);
      this.cleanup();
    }
    return false;
  };

  private handleIframeMessage = async (e: MessageEvent<any>): Promise<void> => {
    const msg = IFrameMessageFactory.parse(e.data);
    if (!msg) return;
    switch (msg.type) {
      case IFrameMessageType.PING: {
        // Send to parent only using service worker because parent messages not always get to parent (thank you m$)
        // TODO relay only on browserApi
        fnConsoleLog('IframeScript->constructor->iframe->ping', msg);
        await BrowserApi.sendRuntimeMessage({ type: BusMessageType.CONTENT_IFRAME_MESSAGE, data: msg });
        break;
      }
      case IFrameMessageType.FETCH: {
        fnConsoleLog('IframeScript->constructor->iframe->fetch', msg);
        await new ContentFetchIframeCommand(msg, this.href).execute();
        break;
      }
      case IFrameMessageType.START_LISTENERS: {
        fnConsoleLog('IframeScript->constructor->iframe->start-listeners', msg);
        this.type = msg.data.type;
        this.uid = msg.uid;
        // TODO pass correct url -> so we save correct href and origin
        // fix screenshot -> pass iframe position inside origin window
        DocumentMediator.startListeners(msg.data.type, {
          stopCallback: () => {
            document.removeEventListener('mouseout', this.handleMouseOut);
          }
        });
        document.addEventListener('mouseout', this.handleMouseOut);
        break;
      }
      case IFrameMessageType.STOP_LISTENERS: {
        DocumentMediator.stopListeners();
      }
    }
  };

  private handleMouseOut = async () => {
    fnConsoleLog('PinMeScript->handleMouseOut', this.id, this.type, this.uid);
    document.removeEventListener('mouseout', this.handleMouseOut);
    DocumentMediator.stopListeners();
    if (!this.type || !this.uid) return;
    await BrowserApi.sendRuntimeMessage<IFrameMessage>({
      type: BusMessageType.CONTENT_IFRAME_MESSAGE,
      data: {
        uid: this.uid,
        type: IFrameMessageType.RESTART_LISTENERS,
        data: { type: this.type }
      }
    });
    this.type = undefined;
  };

  private cleanup(): void {
    window.removeEventListener('message', this.handleIframeMessage);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('mouseout', this.handleMouseOut);
    TinyEventDispatcher.cleanup();
    DocumentMediator.stopListeners();
    ContentMessageHandler.cleanup();
    clearTimeout(this.timeoutId);
  }
}

try {
  if (window.top) {
    new IframeScript(fnUid(), 250);
  }
} catch (e: unknown) {
  fnConsoleError('PinMeScript->PROBLEM !!!', e);
}
