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
import { fnConsoleLog } from '../fn/console.fn';
import { fnIsChrome } from '../service/browser.api.wrapper';

export const reloadContentScript = async (tabId: number): Promise<void> => {
  const scripts = chrome.runtime.getManifest().content_scripts;
  if (!scripts) return;
  try {
    await insertJsFiles(tabId, scripts[0]?.js);
    await insertCssFiles(tabId, scripts[0].css);
  } catch (e) {
    fnConsoleLog('Error', e);
  }
};

const insertJsFiles = async (tabId: number, files: string[] | undefined): Promise<void> => {
  if (!files) return;
  if (fnIsChrome()) {
    await chrome.scripting.executeScript({ target: { tabId }, files });
  } else {
    for (const file of files) {
      await browser.tabs.executeScript(tabId, { file });
    }
  }
};

const insertCssFiles = async (tabId: number, files: string[] | undefined): Promise<void> => {
  if (!files) return;
  if (fnIsChrome()) {
    await chrome.scripting.insertCSS({ target: { tabId }, files });
  } else {
    for (const file of files) {
      await browser.tabs.insertCSS(tabId, { file });
    }
  }
};
