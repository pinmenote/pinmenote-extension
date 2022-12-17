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
import { BusMessage } from '@common/model/bus.model';
import { environmentConfig } from '../environment';
import { fnBrowserApi } from '@common/service/browser.api.wrapper';
import { fnConsoleLog } from '@common/fn/console.fn';

export const sendRuntimeMessage = async <T>(msg: BusMessage<T>): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      fnBrowserApi().runtime.sendMessage(msg, (ack: any) => {
        if (environmentConfig.showAckMessage) fnConsoleLog(`${msg.type}->ack`);
        resolve(ack);
      });
    } catch (e) {
      fnConsoleLog('runtime.lastError', fnBrowserApi().runtime.lastError);
      reject(e);
    }
  });
};
