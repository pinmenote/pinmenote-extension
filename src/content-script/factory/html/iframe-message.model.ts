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
import { fnConsoleLog } from '../../../common/fn/console.fn';

export enum IFrameMessageType {
  FETCH = 'fetch',
  PING = 'ping',
  PONG = 'png',
  ALIVE = 'alive',
  START_LISTENERS = 'start-listeners',
  STOP_LISTENERS = 'stop-listeners'
}

export interface IFrameMessage {
  type: IFrameMessageType;
  data: any;
}

export class IFrameMessageFactory {
  static create(message: IFrameMessage) {
    fnConsoleLog('IFrameMessageFactory->create', message);
    return JSON.stringify(message);
  }

  static parse(msg: string): IFrameMessage | undefined {
    try {
      return JSON.parse(msg);
    } catch (e) {
      /* IGNORE */
      fnConsoleLog('IFrameMessageFactory->parse->error', e, msg);
    }
    return undefined;
  }
}
