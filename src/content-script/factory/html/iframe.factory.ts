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
import { IFrameMessageFactory, IFrameMessageType } from './iframe-message.model';
import { ObjContentTypeDto, ObjIframeContentDto } from '../../../common/model/obj/obj-content.dto';
import { BusMessageType } from '../../../common/model/bus.model';
import { FetchIframeRequest } from '../../../common/model/obj-request.model';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlIntermediateData } from '../../../common/model/html.model';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnUid } from '../../../common/fn/uid.fn';

export class IFrameFactory {
  static computeIframe = async (ref: HTMLIFrameElement, depth: number): Promise<HtmlIntermediateData> => {
    // Skip iframe->iframe->skip
    if (depth > 3) return HtmlAttrFactory.EMPTY_RESULT;
    try {
      fnConsoleLog('IFRAME !!!');
      const uid = fnUid();
      const html = await this.fetchIframe(uid, ref, depth);
      if (!html.ok) return HtmlAttrFactory.EMPTY_RESULT;
      const width = ref.getAttribute('width') || '100%';
      const height = ref.getAttribute('width') || '100%';
      const iframeAttr = Array.from(ref.attributes)
        .map((a) => {
          if (['width', 'height'].includes(a.nodeName)) return '';
          if (a.nodeValue) {
            return `${a.nodeName}="${a.nodeValue}"`;
          }
          return a.nodeName;
        })
        .join(' ');
      return {
        html: `<iframe width="${width}" height="${height}" ${iframeAttr} data-pin-id="${uid}"></iframe>`,
        video: [],
        content: [{ id: uid, type: ObjContentTypeDto.IFRAME, content: html }]
      };
    } catch (e) {
      fnConsoleLog('HtmlFactory->computeIframe->Error', e);
    }
    return HtmlAttrFactory.EMPTY_RESULT;
  };

  private static fetchIframe = (uid: string, ref: HTMLIFrameElement, depth: number): Promise<ObjIframeContentDto> => {
    fnConsoleLog('HtmlFactory->fetchIframe', ref.src);
    return new Promise<ObjIframeContentDto>((resolve, reject) => {
      if (!ref.contentWindow) return HtmlAttrFactory.EMPTY_RESULT;
      TinyEventDispatcher.addListener<FetchIframeRequest>(BusMessageType.CONTENT_IFRAME_PONG, (event, key, value) => {
        fnConsoleLog('HtmlFactory->fetchIframe->ping->clear', value.uid, uid);
        if (value.uid === uid && value.depth === depth) {
          TinyEventDispatcher.removeListener(event, key);
          clearTimeout(iframeTimeout);
          IFrameMessageFactory.postIFrame(ref, { type: IFrameMessageType.FETCH, data: { depth, uid } });
        }
      });
      const eventKey = TinyEventDispatcher.addListener<ObjIframeContentDto>(
        BusMessageType.CONTENT_FETCH_IFRAME_RESULT,
        (event, key, value) => {
          if (value.uid === uid) {
            fnConsoleLog('HtmlFactory->fetchIframe->result', uid, value.url, value);
            clearTimeout(iframeTimeout);
            clearInterval(iframeFetchTimeout);
            TinyEventDispatcher.removeListener(event, eventKey);
            resolve(value);
          }
        }
      );
      IFrameMessageFactory.postIFrame(ref, { type: IFrameMessageType.PING, data: { depth, uid } });
      const iframeTimeout = setTimeout(() => {
        TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IFRAME_RESULT, eventKey);
        reject(`Iframe timeout ${uid} ${ref.src}`);
      }, 500);
      // TODO handle this more gracefully - like ping iframe for status
      const iframeFetchTimeout = setTimeout(() => {
        TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IFRAME_RESULT, eventKey);
        reject(`Iframe timeout ${uid} ${ref.src}`);
      }, 20000);
    });
  };
}
