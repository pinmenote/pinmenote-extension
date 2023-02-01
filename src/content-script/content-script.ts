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
/* URL-s Not transformed correctly
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
*/

import '../css/prosemirror.css';

import { ContentExtensionData, ExtensionThemeDto } from '../common/model/settings.model';
import { fnConsoleError, fnConsoleLog } from '../common/fn/console.fn';
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../common/service/browser.storage.wrapper';
import { BusMessageType } from '../common/model/bus.model';
import { ContentMessageHandler } from './content-message.handler';
import { ContentSettingsStore } from './store/content-settings.store';
import { DocumentMediator } from './mediator/document.mediator';
import { InvalidatePinsCommand } from './command/pin/invalidate-pins.command';
import { ObjectStoreKeys } from '../common/keys/object.store.keys';
import { PinStore } from './store/pin.store';
import { RuntimePinGetHrefCommand } from './command/runtime/runtime-pin-get-href.command';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { UrlFactory } from '../common/factory/url.factory';
import { environmentConfig } from '../common/environment';
import { fnUid } from '../common/fn/uid.fn';

class PinMeScript {
  private href: string;
  private redirectInterval = 0;
  private timeoutId = 0;

  constructor(private readonly id: string, private ms: number) {
    this.href = UrlFactory.normalizeHref(window.location.href);
    ContentMessageHandler.start();
    fnConsoleLog('CONTENT-SCRIPT', this.href);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    TinyEventDispatcher.addListener<number[]>(BusMessageType.CNT_SETTINGS, this.handlePinSettings);
    TinyEventDispatcher.dispatch(BusMessageType.CNT_SETTINGS, {});
  }

  private handlePinSettings = async (event: string, key: string): Promise<void> => {
    TinyEventDispatcher.removeListener(event, key);

    // Link so we navigate further
    if (this.resolveLinkWebsite()) return;

    await ContentSettingsStore.initSettings();

    // if (data.link) new CreateLinkCommand(data.link).execute();
    await new RuntimePinGetHrefCommand().execute();
    this.initTimeout();

    const theme = window.matchMedia('(prefers-color-scheme: light)').matches
      ? ExtensionThemeDto.LIGHT
      : ExtensionThemeDto.DARK;
    await BrowserApi.sendRuntimeMessage<ContentExtensionData>({
      type: BusMessageType.CONTENT_THEME,
      data: {
        theme
      }
    });
  };

  private resolveLinkWebsite(): boolean {
    if (!window.location.href.startsWith(environmentConfig.shortUrl)) return false;
    this.redirectInterval = window.setInterval(this.linkRedirect, 100);
    return true;
  }

  private linkRedirect = async (): Promise<void> => {
    const urlData = document.getElementById('urlData');
    if (urlData) {
      clearInterval(this.redirectInterval);
      if (urlData.innerText) {
        const { data } = JSON.parse(urlData.innerText);
        await BrowserStorageWrapper.set(ObjectStoreKeys.OBJECT_LINK, data);
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        document.location.href = data.url.href;
      }
    }
  };

  private handleVisibilityChange = async (e: Event): Promise<void> => {
    fnConsoleLog('visibilitychange', e);
    await this.invalidatePins();
    this.initTimeout();
    await this.invalidateContentScript();
  };

  private initTimeout = (): void => {
    clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(this.invalidatePins, this.ms);
  };

  private invalidatePins = async (): Promise<void> => {
    await new InvalidatePinsCommand(this.href).execute();
    this.href = UrlFactory.normalizeHref(window.location.href);
    this.adaptIntervalMs();
    this.initTimeout();
  };

  private invalidateContentScript = async (): Promise<void> => {
    try {
      await BrowserApi.sendRuntimeMessage<undefined>({
        type: BusMessageType.CONTENT_INVALIDATE
      });
    } catch (e) {
      fnConsoleLog('invalidateContentScript->cleanup', e);
      this.cleanup();
    }
  };

  private cleanup(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    TinyEventDispatcher.cleanup();
    DocumentMediator.stopListeners();
    PinStore.clear();
    ContentMessageHandler.cleanup();
    clearTimeout(this.timeoutId);
  }

  private adaptIntervalMs() {
    switch (this.ms) {
      case 250:
        this.ms = 500;
        break;
      case 500:
        this.ms = 1000;
        break;
      default:
        this.ms = 2000;
        break;
    }
  }
}
try {
  new PinMeScript(fnUid(), 250);
  fnConsoleLog('PinMeScript -> STARTED !!!');
} catch (e: unknown) {
  fnConsoleError('PROBLEM PinMeScript.new !!!', e);
}
