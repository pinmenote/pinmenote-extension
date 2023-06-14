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
import { IFrameIndexMessage, IFrameListenerMessage } from '../common/model/iframe-message.model';
import { fnConsoleError, fnConsoleLog } from '../common/fn/fn-console';
import { BrowserApi } from '@pinmenote/browser-api';
import { BrowserStorage } from '@pinmenote/browser-api';
import { BusMessageType } from '../common/model/bus.model';
import { ContentMessageHandler } from '../content-script/content-message.handler';
import { ContentSettingsStore } from '../content-script/store/content-settings.store';
import { DocumentMediator } from '../content-script/mediator/document.mediator';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { UrlFactory } from '../common/factory/url.factory';
import { fnIframeIndex } from '../common/fn/fn-iframe-index';
import { fnIsIframe } from '../common/fn/fn-is-iframe';
import { fnUid } from '../common/fn/fn-uid';

/**
 * IframeScript runs at document_idle -> all_frames
 * this prevents crashing extension on some web pages with infinite iframe loop (thank you fb)
 */
export class IframeScript {
  private readonly href: string;
  private timeoutId = 0;

  constructor(private readonly id: string) {
    this.href = UrlFactory.normalizeHref(window.location.href);

    fnConsoleLog('IframeScript->constructor', this.id, this.href);

    ContentMessageHandler.start(this.href, true, this.id);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    document.addEventListener('mouseout', this.handleMouseOut);

    TinyDispatcher.addListener<number[]>(BusMessageType.CNT_SETTINGS, this.handlePinSettings);
    TinyDispatcher.dispatch(BusMessageType.CNT_SETTINGS, {});
  }

  private handlePinSettings = async (event: string, key: string): Promise<void> => {
    TinyDispatcher.removeListener(event, key);

    await ContentSettingsStore.initSettings();
  };

  private handleVisibilityChange = async (): Promise<void> => {
    fnConsoleLog('IframeScript->handleVisibilityChange', this.id);
    await this.invalidateContentScript();
  };

  private invalidateContentScript = async (): Promise<boolean> => {
    try {
      await BrowserStorage.get('foo');
      return true;
    } catch (e) {
      fnConsoleLog('IframeScript->Error', this.id, e);
      this.cleanup();
    }
    return false;
  };

  private handleMouseOut = async () => {
    if (DocumentMediator.active) {
      fnConsoleLog('IframeScript->handleMouseOut', this.id);
      DocumentMediator.stopListeners();
      await this.iframeMouseOut();
    }
  };

  private iframeMouseOut = async (): Promise<void> => {
    const index = fnIframeIndex();
    await BrowserApi.sendRuntimeMessage<IFrameIndexMessage | IFrameListenerMessage>({
      type: BusMessageType.IFRAME_MOUSE_OUT,
      data: { index, uid: this.id, type: DocumentMediator.type }
    });
  };

  private cleanup(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('mouseout', this.handleMouseOut);
    TinyDispatcher.cleanup();
    DocumentMediator.stopListeners();
    ContentMessageHandler.cleanup();
    clearTimeout(this.timeoutId);
  }
}

try {
  if (fnIsIframe()) {
    new IframeScript(fnUid());
  }
} catch (e: unknown) {
  fnConsoleError('PinMeScript->PROBLEM !!!', e);
}
