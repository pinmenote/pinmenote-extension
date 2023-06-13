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
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { fnConsoleLog } from '../../common/fn/fn-console';

export class ScriptService {
  static reloadScripts = async (): Promise<void> => {
    try {
      const activeTab = await BrowserApi.activeTab();
      if (!activeTab?.url) return;
      if (activeTab.url.startsWith('chrome')) return;

      if (!activeTab.id) return;
      await reloadContentScript(activeTab.id);
    } catch (e) {
      fnConsoleLog('Error reloadActiveTabScript', e);
    }
  };
}

const reloadContentScript = async (tabId: number): Promise<void> => {
  const scripts = chrome.runtime.getManifest().content_scripts;
  if (!scripts) return;
  try {
    fnConsoleLog('reloadContentScript->js', scripts[0].js, 'css', scripts[0].css);
    if (scripts[0].js) await insertJsFiles(tabId, scripts[0].js);
    if (scripts[0].css) await insertCssFiles(tabId, scripts[0].css);
  } catch (e) {
    fnConsoleLog('Error->reloadContentScript', e);
  }
};

const insertJsFiles = async (tabId: number, files: string[] | undefined): Promise<void> => {
  if (!files) return;
  if (BrowserApi.isChrome) {
    await chrome.scripting.executeScript({ target: { tabId }, files });
  } else {
    for (const file of files) {
      await browser.tabs.executeScript(tabId, { file });
    }
  }
};

const insertCssFiles = async (tabId: number, files: string[] | undefined): Promise<void> => {
  if (!files) return;
  if (BrowserApi.isChrome) {
    await chrome.scripting.insertCSS({ target: { tabId }, files });
  } else {
    for (const file of files) {
      await browser.tabs.insertCSS(tabId, { file });
    }
  }
};
