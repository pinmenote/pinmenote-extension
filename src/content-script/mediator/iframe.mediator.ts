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
import { IFrameMessage, IFrameMessageType } from '../../common/model/iframe-message.model';
import { DocumentMediator } from './document.mediator';
import { fnUid } from '../../common/fn/uid.fn';

interface IframeValue {
  element: HTMLIFrameElement;
  callback?: (msg: IFrameMessage) => void;
}

export class IframeMediator {
  private static iframeMap: { [key: string]: IframeValue } = {};

  static addIframe = (element: HTMLIFrameElement, callback?: (msg: any) => void): string => {
    const uid = fnUid();
    this.iframeMap[uid] = { element, callback };
    return uid;
  };

  static removeIframe(uid: string) {
    delete this.iframeMap[uid];
  }

  static resolveIframeMessage = (msg: IFrameMessage) => {
    if (this.iframeMap[msg.uid]) {
      const value = this.iframeMap[msg.uid];

      if (value.callback) value.callback(msg);
      if (!msg.keep) delete this.iframeMap[msg.uid];

      if (msg.type === IFrameMessageType.RESTART_LISTENERS) {
        DocumentMediator.startListeners(msg.data.type);
      }
    }
  };
}
