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

import { BusMessageType, TimeoutMessage } from '../common/model/bus.model';
import { ContentExtensionData, ContentSettingsData, ExtensionTheme } from '../common/model/settings.model';
import { fnConsoleError, fnConsoleLog } from '../common/fn/console.fn';
import { BrowserStorageWrapper } from '../common/service/browser.storage.wrapper';
import { ContentMessageHandler } from './content-message.handler';
import { CreateLinkCommand } from './command/link/create-link.command';
import { DocumentMediator } from './mediator/document.mediator';
import { InvalidatePinsCommand } from './command/pin/invalidate-pins.command';
import { ObjectStoreKeys } from '../common/keys/object.store.keys';
import { PinStore } from './store/pin.store';
import { RuntimePinGetHrefCommand } from './command/runtime/runtime-pin-get-href.command';
import { SettingsStore } from './store/settings.store';
import { TinyEventDispatcher } from '../common/service/tiny.event.dispatcher';
import { WindowMediator } from './mediator/window.mediator';
import { environmentConfig } from '../common/environment';
import { fnNormalizeHref } from '../common/fn/normalize.url.fn';
import { fnUid } from '../common/fn/uid.fn';
import { sendRuntimeMessage } from '../common/message/runtime.message';
import LinkDto = Pinmenote.Pin.LinkDto;

class PinMeScript {
  private href: string;
  private redirectInterval = 0;

  constructor(private readonly id: string, private ms: number) {
    this.href = fnNormalizeHref(window.location.href);
    WindowMediator.start();
    ContentMessageHandler.start();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    TinyEventDispatcher.addListener<ContentSettingsData>(BusMessageType.CONTENT_SETTINGS, this.handleContentSettings);
    TinyEventDispatcher.addListener<number[]>(BusMessageType.CNT_SETTINGS, this.handlePinSettings);
    TinyEventDispatcher.dispatch(BusMessageType.CNT_SETTINGS, {});

    TinyEventDispatcher.addListener<TimeoutMessage>(BusMessageType.CONTENT_TIMEOUT, this.handleContentTimeout);
  }

  private handleContentTimeout = async (event: string, key: string, value: TimeoutMessage) => {
    if (value.id === this.id) {
      await new InvalidatePinsCommand(this.href).execute();
      this.href = fnNormalizeHref(window.location.href);
      await sendRuntimeMessage<TimeoutMessage>({
        type: BusMessageType.CONTENT_TIMEOUT,
        data: { id: this.id, ms: this.ms }
      });
      this.adaptIntervalMs();
    }
  };

  private handleContentSettings = async (event: string, key: string, data: ContentSettingsData) => {
    SettingsStore.setSettings(data);
    if (data.link) new CreateLinkCommand(data.link).execute();
    await new RuntimePinGetHrefCommand().execute();
    await this.initialTimeout();
  };

  private handlePinSettings = async (event: string, key: string): Promise<void> => {
    const lastId = await BrowserStorageWrapper.get(ObjectStoreKeys.OBJECT_LAST_ID);
    fnConsoleLog('handlePinSettings->LAST ID !!!', lastId);
    this.checkForLink();
    TinyEventDispatcher.removeListener(event, key);
    const theme = window.matchMedia('(prefers-color-scheme: light)').matches
      ? ExtensionTheme.LIGHT
      : ExtensionTheme.DARK;
    await sendRuntimeMessage<ContentExtensionData>({
      type: BusMessageType.CONTENT_SETTINGS,
      data: {
        href: this.href,
        theme
      }
    });
  };

  private checkForLink(): void {
    if (!window.location.href.startsWith(environmentConfig.shortUrl)) return;
    this.redirectInterval = window.setInterval(this.redirect, 100);
  }

  private redirect = async (): Promise<void> => {
    const urlData = document.getElementById('urlData');
    if (urlData) {
      clearInterval(this.redirectInterval);
      if (urlData.innerText) {
        const { data } = JSON.parse(urlData.innerText);
        await sendRuntimeMessage<LinkDto>({ type: BusMessageType.CONTENT_LINK_ADD, data });
      }
    }
  };

  private handleVisibilityChange = async (e: Event): Promise<void> => {
    fnConsoleLog('visibilitychange', e);
    await this.initialTimeout();
    try {
      await sendRuntimeMessage<undefined>({
        type: BusMessageType.CONTENT_PIN_CHANGED
      });
    } catch (e) {
      fnConsoleLog('PROBLEM->handleVisibilityChange !!!', e);
      this.cleanup();
    }
  };

  private async initialTimeout(): Promise<void> {
    fnConsoleLog('initialTimeout');
    try {
      // TODO move to settings
      await sendRuntimeMessage<TimeoutMessage>({
        type: BusMessageType.CONTENT_TIMEOUT,
        data: { id: this.id, ms: this.ms }
      });
    } catch (e) {
      fnConsoleLog('PROBLEM->initialTimeout !!!', e);
      this.cleanup();
    }
  }

  private cleanup(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    TinyEventDispatcher.cleanup();
    DocumentMediator.stopListeners();
    PinStore.clear();
    WindowMediator.cleanup();
    ContentMessageHandler.cleanup();
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
