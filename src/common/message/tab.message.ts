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
import { BusMessage } from '../model/bus.model';
import { fnBrowserApi } from '../service/browser.api.wrapper';
import { fnConsoleLog } from '../fn/console.fn';

export const sendTabMessage = <T>(msg: BusMessage<T>): Promise<void> => {
  return new Promise((resolve: (...arg: any) => void, reject: (...arg: any) => void) => {
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-floating-promises */
    fnBrowserApi().tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const currentTab: chrome.tabs.Tab | undefined = tabs[0];
      if (currentTab?.id) {
        try {
          fnBrowserApi().tabs.sendMessage(currentTab.id, msg, resolve);
        } catch (e) {
          fnConsoleLog('Error sendTabMessage', msg, e);
          reject(e);
        }
      }
    });
  });
};
