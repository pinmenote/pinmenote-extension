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
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlIntermediateData } from '../../../common/model/html.model';
import { IFrameMessageFactory } from './iframe-message.factory';
import { IframeMediator } from '../../mediator/iframe.mediator';
import { ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class IFrameFactory {
  static computeIframe = async (ref: HTMLIFrameElement, depth: number): Promise<HtmlIntermediateData> => {
    // Skip iframe->iframe->skip
    if (depth > 3) return HtmlAttrFactory.EMPTY_RESULT;
    try {
      const msg = await this.fetchIframe(ref, depth);
      if (!msg.data.ok) return HtmlAttrFactory.EMPTY_RESULT;
      const width = ref.getAttribute('width') || '100%';
      const height = ref.getAttribute('width') || '100%';
      const iframeAttr = Array.from(ref.attributes)
        .map((a) => {
          if (['width', 'height', 'src'].includes(a.nodeName)) return '';
          if (a.nodeValue) {
            return `${a.nodeName}="${a.nodeValue}"`;
          }
          return a.nodeName;
        })
        .join(' ');
      return {
        html: `<iframe width="${width}" height="${height}" ${iframeAttr} data-pin-id="${msg.uid}"></iframe>`,
        video: [],
        content: [{ id: msg.uid, type: ObjContentTypeDto.IFRAME, content: msg.data }]
      };
    } catch (e) {
      fnConsoleLog('IFrameFactory->computeIframe->Error', e);
    }
    return HtmlAttrFactory.EMPTY_RESULT;
  };

  private static fetchIframe = (ref: HTMLIFrameElement, depth: number): Promise<IFrameMessage> => {
    fnConsoleLog('IFrameFactory->fetchIframe', ref.src);
    return new Promise<IFrameMessage>((resolve, reject) => {
      if (!ref.contentWindow) return HtmlAttrFactory.EMPTY_RESULT;
      const uid = IframeMediator.addIframe(ref, (msg: IFrameMessage) => {
        fnConsoleLog('IFrameFactory->fetchIframe->callback', msg.type);
        if (msg.uid === uid && msg.type === IFrameMessageType.PING) {
          clearTimeout(iframeTimeout);
          IFrameMessageFactory.postIFrame(ref, { type: IFrameMessageType.FETCH, data: { depth }, uid });
        } else if (msg.uid === uid && msg.type === IFrameMessageType.FETCH) {
          clearInterval(iframeFetchTimeout);
          resolve(msg);
        }
      });

      IFrameMessageFactory.postIFrame(ref, { type: IFrameMessageType.PING, uid, keep: true });

      // TODO handle this more gracefully - like ping iframe for status
      const iframeFetchTimeout = setTimeout(() => {
        reject(`Iframe iframeFetchTimeout ${uid} ${ref.src}`);
      }, 20000);
      const iframeTimeout = setTimeout(() => {
        reject(`Iframe iframeTimeout ${uid} ${ref.src}`);
      }, 500);
    });
  };
}
