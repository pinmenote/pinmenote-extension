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
import { BusMessageType, TimeoutMessage } from '../model/bus.model';
import { TinyEventDispatcher } from '../service/tiny.event.dispatcher';
import { fnUid } from './uid.fn';
import { sendRuntimeMessage } from '../message/runtime.message';

export const fnSleep = async (ms: number): Promise<void> => {
  const id = fnUid();
  await sendRuntimeMessage<TimeoutMessage>({ type: BusMessageType.CONTENT_TIMEOUT, data: { id, ms } });
  return new Promise((resolve) => {
    TinyEventDispatcher.addListener<TimeoutMessage>(BusMessageType.CONTENT_TIMEOUT, (event, key, value) => {
      TinyEventDispatcher.removeListener(event, key);
      if (value.id === id) {
        resolve();
      }
    });
  });
};
