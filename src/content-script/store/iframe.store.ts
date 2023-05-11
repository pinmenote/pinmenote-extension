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
import { IFrameIndexMessage, IFrameListenerMessage } from '../../common/model/iframe-message.model';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { DocumentMediator } from '../mediator/document.mediator';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class IFrameStore {
  private static iframeMap: { [key: string]: IFrameIndexMessage } = {};
  private static passIndex?: IFrameIndexMessage;

  static registerIframe(value: IFrameIndexMessage) {
    if (value.index in this.iframeMap) {
      fnConsoleLog('IframeMediator->registerIframe->exists !!!', value.index, value.uid);
      return;
    }
    this.iframeMap[value.index] = value;
    fnConsoleLog('IframeMediator->registerIframe', value.index, value.uid);
  }

  static findIndex(ref: HTMLIFrameElement): IFrameIndexMessage | undefined {
    const frames = Array.from(window.frames);
    for (let i = 0; i < frames.length; i++) {
      if (frames[i] === ref.contentWindow) {
        return this.iframeMap[`.${i}`];
      }
    }
    return undefined;
  }

  static passListeners(msg: IFrameIndexMessage) {
    this.passIndex = msg;
  }

  static resumeListeners(msg: IFrameListenerMessage) {
    if (msg.uid === this.passIndex?.uid) {
      fnConsoleLog('IframeStore->resumeListeners', msg);
      DocumentMediator.startListeners(msg.type);
    }
  }

  static stopListeners() {
    Object.values(this.iframeMap).forEach(async (data) => {
      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_STOP_LISTENERS, data });
    });
  }
}
