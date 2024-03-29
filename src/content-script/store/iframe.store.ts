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
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../common/model/bus.model';
import { DocumentMediator } from '../mediator/document.mediator';
import { IFrameDataStore } from '@pinmenote/page-compute';
import { fnConsoleLog } from '../../common/fn/fn-console';
import { fnIframeIndex } from '../../common/fn/fn-iframe-index';

export class IFrameStore implements IFrameDataStore {
  private static instance: IFrameStore;
  private static iframeMap: { [key: string]: IFrameIndexMessage } = {};
  private static passIndex?: IFrameIndexMessage;

  static getInstance(): IFrameStore {
    if (!this.instance) this.instance = new IFrameStore();
    return this.instance;
  }

  registerIframe = (value: IFrameIndexMessage, uid: string) => {
    IFrameStore.iframeMap[value.index] = value;
    fnConsoleLog('IFrameStore->registerIframe', value.index, value.uid, 'inside', uid);
  };

  findIndex = (ref: HTMLIFrameElement): IFrameIndexMessage | undefined => {
    const myIndex = fnIframeIndex();
    const frames = Array.from(window.frames);
    for (let i = 0; i < frames.length; i++) {
      if (frames[i] === ref.contentWindow) {
        return IFrameStore.iframeMap[`${myIndex}.${i}`];
      }
    }
    return undefined;
  };

  static passListeners(msg: IFrameIndexMessage) {
    this.passIndex = msg;
  }

  static resumeListeners(msg: IFrameListenerMessage) {
    if (msg.uid === this.passIndex?.uid) {
      fnConsoleLog('IframeStore->resumeListeners', msg);
      DocumentMediator.resumeListeners(msg.type);
    }
  }

  static stopListeners() {
    Object.values(this.iframeMap).forEach(async (data) => {
      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_STOP_LISTENERS, data });
    });
  }
}
