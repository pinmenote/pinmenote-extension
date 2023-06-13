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
import { BusMessage } from '../model/bus.model';
import { environmentConfig } from '../environment';
import { fnConsoleLog } from '../fn/fn-console';

export type BrowserGlobal = typeof chrome | typeof browser;
export type BrowserRuntime = typeof chrome.runtime | typeof browser.runtime;
export type BrowserTabs = typeof chrome.tabs | typeof browser.tabs;
export type BrowserTab = chrome.tabs.Tab | browser.tabs.Tab;
export type BrowserTabObject = chrome.tabs.Tab | browser.tabs.Tab;
export type BrowserLocalStore = typeof chrome.storage.local | typeof browser.storage.local;
export type BrowserDownloads = typeof chrome.downloads | typeof browser.downloads;
export type BrowserAction = typeof chrome.action | typeof browser.browserAction;
export type BrowserTabChangeInfo = chrome.tabs.TabChangeInfo | browser.tabs._OnUpdatedChangeInfo;

export class BrowserApi {
  private static browserApi: BrowserGlobal;
  private static isChromeValue = false;

  static init() {
    if (this.browserApi) return;
    try {
      this.browserApi = browser;
    } catch (e) {
      this.browserApi = chrome;
      this.isChromeValue = true;
    }
  }

  static get isChrome(): boolean {
    return this.isChromeValue;
  }

  static get browser(): BrowserGlobal {
    return this.browserApi;
  }

  static get runtime(): BrowserRuntime {
    return this.browserApi.runtime;
  }

  static get tabs(): BrowserTabs {
    return this.browserApi.tabs;
  }

  static activeTab = async (): Promise<BrowserTab> => {
    const tabs = await this.browserApi.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  };

  static setActiveTabUrl = async (url: string): Promise<void> => {
    const tab = await this.activeTab();
    await this.browserApi.tabs.update(tab.id, { url });
  };

  static get localStore(): BrowserLocalStore {
    return this.browserApi.storage.local;
  }

  static get downloads(): BrowserDownloads {
    return this.browserApi.downloads;
  }

  static get browserAction(): BrowserAction {
    if (this.isChromeValue) return this.browserApi.action;
    return this.browserApi.browserAction;
  }

  static get startUrl(): string {
    return this.isChromeValue ? 'chrome-extension' : 'moz-extension';
  }

  static get disabledUrl(): string {
    return this.isChromeValue ? 'chrome://' || 'chrome-extension://' : 'moz://' || 'moz-extension://';
  }

  static get runtimeUrl(): string {
    if (BrowserApi.isChrome) {
      return `chrome-extension://${chrome.runtime.id}`;
    }
    return 'moz-extension://';
  }

  static openOptionsPage(subpage = ''): void {
    if (this.isChromeValue) {
      const optionsPage = chrome.runtime.getManifest().options_ui?.page;
      if (optionsPage) window.open(`chrome-extension://${chrome.runtime.id}/${optionsPage}${subpage}`);
      return;
    }
    window.open(browser.runtime.getManifest().options_ui?.page);
    window.close();
  }

  static shadowRoot(el: Element): ShadowRoot | null {
    try {
      if (this.isChromeValue) {
        /* eslint-disable @typescript-eslint/no-unsafe-call */
        return chrome.dom.openOrClosedShadowRoot(el);
      }
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      return el.openOrClosedShadowRoot();
    } catch (e) {
      fnConsoleLog('BrowserApiWrapper->shadowRoot->ERROR', el, e);
    }
    return null;
  }

  static sendTabMessage = <T>(msg: BusMessage<T>): Promise<void> => {
    return new Promise((resolve: (...arg: any) => void, reject: (...arg: any) => void) => {
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      /* eslint-disable @typescript-eslint/no-floating-promises */
      this.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        const currentTab: BrowserTabObject | undefined = tabs[0];
        if (currentTab?.id) {
          try {
            this.tabs.sendMessage(currentTab.id, msg, resolve);
          } catch (e) {
            fnConsoleLog('Error sendTabMessage', msg, e, 'lastError', BrowserApi.runtime.lastError);
            reject(e);
          }
        }
      });
    });
  };

  static sendRuntimeMessage = async <T>(msg: BusMessage<T>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        this.runtime.sendMessage(msg, (ack: any) => {
          if (environmentConfig.showAckMessage) fnConsoleLog(`${msg.type}->ack`);
          resolve(ack);
        });
      } catch (e) {
        fnConsoleLog('runtime.lastError', msg, e, 'lastError', BrowserApi.runtime.lastError);
        reject(e);
      }
    });
  };
}
BrowserApi.init();
