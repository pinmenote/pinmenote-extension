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
import { fnGetKey } from '@common/kv.utils';

export type BrowserGlobal = typeof chrome | typeof browser;

let pinMeBrowserApi: BrowserGlobal;
let isChrome = false;
try {
  pinMeBrowserApi = browser;
} catch (e) {
  pinMeBrowserApi = chrome;
  isChrome = true;
}

export function fnBrowserApi(): BrowserGlobal {
  return pinMeBrowserApi;
}

export function fnExtensionStartUrl(): string {
  return isChrome ? 'chrome-extension' : 'moz-extension';
}

export function fnOpenOptionsPage(subpage = ''): void {
  if (isChrome) {
    const optionsPage = chrome.runtime.getManifest().options_ui?.page;
    if (optionsPage) window.open(`chrome-extension://${chrome.runtime.id}/${optionsPage}${subpage}`);
    return;
  }
  window.open(browser.runtime.getManifest().options_ui?.page);
  window.close();
}

export function fnBrowserLogoIcon(): string {
  if (isChrome) {
    return fnGetKey(chrome.runtime.getManifest().icons, '32');
  }
  return fnGetKey(browser.runtime.getManifest().browser_action?.default_icon, '32');
}

export function fnRuntimeUrl(): string {
  if (isChrome) {
    return `chrome-extension://${chrome.runtime.id}`;
  }
  return 'moz-extension://';
}

export function fnIsChrome(): boolean {
  return isChrome;
}
