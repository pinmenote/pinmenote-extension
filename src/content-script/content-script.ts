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
/* URL-s Not transformed correctly
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
*/
import { ContentExtensionData, ExtensionThemeDto } from '../common/model/settings.model';
import { fnConsoleError, fnConsoleLog } from '../common/fn/fn-console';
import { BrowserApi } from '@pinmenote/browser-api';
import { BrowserStorage } from '@pinmenote/browser-api';
import { BusMessageType } from '../common/model/bus.model';
import { ContentMessageHandler } from './content-message.handler';
import { ContentSettingsStore } from './store/content-settings.store';
import { DocumentMediator } from './mediator/document.mediator';
import { DocumentStore } from './store/document.store';
import { InvalidatePinsCommand } from './command/pin/invalidate-pins.command';
import { PinStore } from './store/pin.store';
import { RuntimePinGetHrefCommand } from './command/runtime/runtime-pin-get-href.command';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { UrlFactory } from '../common/factory/url.factory';
import { fnUid } from '../common/fn/fn-uid';

class PinMeScript {
  private href: string;
  private timeoutId = 0;
  private mutations: MutationObserver;
  private doc: DocumentStore = DocumentStore.getInstance();

  constructor(private readonly id: string, private ms: number) {
    this.href = UrlFactory.normalizeHref(window.location.href);
    ContentMessageHandler.start(this.href);
    this.mutations = new MutationObserver(this.handleMutations);
    this.mutations.observe(document.documentElement || document.body, { childList: true, subtree: true });

    fnConsoleLog('PinMeScript->constructor', this.href, 'referrer', document.referrer);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    TinyDispatcher.getInstance().addListener<number[]>(BusMessageType.CNT_SETTINGS, this.handlePinSettings);
    TinyDispatcher.getInstance().dispatch(BusMessageType.CNT_SETTINGS, {});
  }

  private handlePinSettings = async (event: string, key: string): Promise<void> => {
    TinyDispatcher.getInstance().removeListener(event, key);

    await ContentSettingsStore.initSettings();

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

  private handleMutations = (mutationList: MutationRecord[]) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        for (const added of mutation.removedNodes) {
          this.doc.add(added, mutation.target);
        }
      }
    }
  };

  private handleVisibilityChange = async (): Promise<void> => {
    fnConsoleLog('PinMeScript->handleVisibilityChange', this.id);
    if (await this.invalidateContentScript()) {
      await this.invalidatePins();
      this.initTimeout();
    }
  };

  private initTimeout = (): void => {
    clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(this.invalidatePins, this.ms);
  };

  private invalidatePins = async (): Promise<void> => {
    await new InvalidatePinsCommand(this.href).execute();

    this.href = UrlFactory.normalizeHref(window.location.href);
    ContentMessageHandler.updateHref(this.href);

    this.adaptIntervalMs();
    this.initTimeout();
  };

  private invalidateContentScript = async (): Promise<boolean> => {
    try {
      await BrowserStorage.get('foo');
      return true;
    } catch (e) {
      fnConsoleLog('PinMeScript->Error', this.id, e);
      this.cleanup();
    }
    return false;
  };

  private cleanup(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    TinyDispatcher.getInstance().cleanup();
    DocumentMediator.stopListeners();
    PinStore.clear();
    ContentMessageHandler.cleanup();
    clearTimeout(this.timeoutId);
    this.mutations.disconnect();
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
} catch (e: unknown) {
  fnConsoleError('PinMeScript->PROBLEM !!!', e);
}
