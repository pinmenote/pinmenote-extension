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
import { IFrameMessageFactory, IFrameMessageType } from '../content-script/factory/html/iframe-message.model';
import { fnConsoleError, fnConsoleLog } from '../common/fn/console.fn';
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../common/service/browser.storage.wrapper';
import { BusMessageType } from '../common/model/bus.model';
import { ContentFetchIframeCommand } from '../content-script/command/snapshot/content-fetch-iframe.command';
import { ContentMessageHandler } from '../content-script/content-message.handler';
import { ContentSettingsStore } from '../content-script/store/content-settings.store';
import { DocumentMediator } from '../content-script/mediator/document.mediator';
import { ObjTypeDto } from '../common/model/obj/obj.dto';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { UrlFactory } from '../common/factory/url.factory';
import { fnUid } from '../common/fn/uid.fn';

export class IframeScript {
  private href: string;
  private timeoutId = 0;
  private type?: ObjTypeDto;

  constructor(private readonly id: string, private ms: number) {
    this.href = UrlFactory.normalizeHref(window.location.href);
    window.addEventListener('message', this.handleIframeMessage);

    ContentMessageHandler.start(this.href);

    fnConsoleLog('IframeScript->constructor', this.href, window.top);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    TinyEventDispatcher.addListener<number[]>(BusMessageType.CNT_SETTINGS, this.handlePinSettings);
    TinyEventDispatcher.dispatch(BusMessageType.CNT_SETTINGS, {});
  }

  private handlePinSettings = async (event: string, key: string): Promise<void> => {
    TinyEventDispatcher.removeListener(event, key);

    await ContentSettingsStore.initSettings();
  };

  private handleVisibilityChange = async (): Promise<void> => {
    fnConsoleLog('PinMeScript->handleVisibilityChange', this.id);
    await this.invalidateContentScript();
  };

  private invalidateContentScript = async (): Promise<boolean> => {
    try {
      await BrowserStorageWrapper.get('foo');
      return true;
    } catch (e) {
      fnConsoleLog('PinMeScript->Error', this.id, e);
      this.cleanup();
    }
    return false;
  };

  private handleIframeMessage = async (e: MessageEvent<any>): Promise<void> => {
    const msg = IFrameMessageFactory.parse(e.data);
    if (!msg) return;
    if (msg.type === IFrameMessageType.PING) {
      // Send to parent only using service worker because parent messages not always get to parent
      // TODO relay only on browserApi
      fnConsoleLog('PinMeScript->constructor->iframe->ping', msg);
      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.CONTENT_IFRAME_PONG, data: msg.data });
    } else if (msg.type === IFrameMessageType.FETCH) {
      fnConsoleLog('PinMeScript->constructor->iframe->fetch', msg);
      await new ContentFetchIframeCommand(msg.data, this.href).execute();
    } else if (msg.type === IFrameMessageType.START_LISTENERS) {
      fnConsoleLog('PinMeScript->constructor->iframe->start-listeners', msg);
      this.type = msg.data.type;
      // TODO pass correct url -> so we save correct href and origin
      // fix screenshot -> pass iframe position inside origin window
      DocumentMediator.startListeners(msg.data.type, {
        stopCallback: () => {
          document.removeEventListener('mouseout', this.handleMouseOut);
        }
      });
      // TODO fix racing
      setTimeout(() => {
        document.addEventListener('mouseout', this.handleMouseOut);
      }, 200);
    }
  };

  private handleMouseOut = () => {
    fnConsoleLog('PinMeScript->handleMouseOut', this.id, this.type);
    document.removeEventListener('mouseout', this.handleMouseOut);
    DocumentMediator.stopListeners();
    IFrameMessageFactory.postParent({ type: IFrameMessageType.RESTART_LISTENERS, data: { type: this.type } });
    this.type = undefined;
  };

  private cleanup(): void {
    window.removeEventListener('message', this.handleIframeMessage);
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
