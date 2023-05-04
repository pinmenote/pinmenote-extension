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
import { IFrameMessage, IFrameMessageType } from '../../../common/model/iframe-message.model';
import { fnUid } from '../../../common/fn/uid.fn';

export class IFrameMessageFactory {
  static parse(msg: any): IFrameMessage | undefined {
    try {
      if (!msg) return undefined;
      if (!(msg instanceof Object)) {
        msg = JSON.parse(msg);
      }
      if (msg.type && msg.uid) {
        // fnConsoleLog('IFrameMessageFactory->parse', msg);
        return msg;
      }
    } catch (e) {
      /* IGNORE */
      // fnConsoleLog('IFrameMessageFactory->parse->error', e, msg);
    }
    return undefined;
  }

  static postIFrame(iframe: HTMLIFrameElement, msg: IFrameMessage) {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage(this.create(msg), '*');
  }

  static cleanupListeners(frames: HTMLIFrameElement[]) {
    frames.forEach((el) => {
      IFrameMessageFactory.postIFrame(el, {
        type: IFrameMessageType.PING,
        uid: fnUid(),
        keep: false
      });
    });
  }

  private static create(message: IFrameMessage) {
    // fnConsoleLog('IFrameMessageFactory->create', message);
    return JSON.stringify(message);
  }
}
