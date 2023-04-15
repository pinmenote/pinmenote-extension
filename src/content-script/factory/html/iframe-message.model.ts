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
  LOADED = 'loaded',
  FETCH = 'fetch',
  PING = 'ping',
  PONG = 'pong',
  ALIVE = 'alive',
  START_LISTENERS = 'start-listeners',
  RESTART_LISTENERS = 'restart-listeners' // to parent
}

export interface IFrameMessage {
  type: IFrameMessageType;
  data: any;
}

export class IFrameMessageFactory {
  static parse(msg: any): IFrameMessage | undefined {
    try {
      if (!msg) return undefined;
      if (msg instanceof Object) return msg;
      fnConsoleLog('IFrameMessageFactory->parse', msg);
      return JSON.parse(msg);
    } catch (e) {
      /* IGNORE */
      fnConsoleLog('IFrameMessageFactory->parse->error', e, msg);
    }
    return undefined;
  }

  static postParent(msg: IFrameMessage) {
    if (!window.top) return;
    window.top.postMessage(this.create(msg));
  }

  static postIFrame(iframe: HTMLIFrameElement, msg: IFrameMessage) {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage(this.create(msg), '*');
  }

  private static create(message: IFrameMessage) {
    fnConsoleLog('IFrameMessageFactory->create', message);
    return JSON.stringify(message);
  }
}
