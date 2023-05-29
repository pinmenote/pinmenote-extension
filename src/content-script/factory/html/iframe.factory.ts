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
import { IFrameFetchMessage, IFrameIndexMessage } from '../../../common/model/iframe-message.model';
import { ObjContentTypeDto, ObjSnapshotContentDto } from '../../../common/model/obj/obj-content.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { CssFactory } from '../css.factory';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlFactory } from './html.factory';
import { HtmlIntermediateData } from '../../model/html.model';
import { IFrameStore } from '../../store/iframe.store';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';
import { fnUid } from '../../../common/fn/fn-uid';

export class IFrameFactory {
  static computeIframe = async (ref: HTMLIFrameElement, depth: number): Promise<HtmlIntermediateData> => {
    fnConsoleLog('IFrameFactory->computeIframe->START');
    // Skip iframe->iframe->skip
    if (depth > 3) return HtmlAttrFactory.EMPTY_RESULT;
    const msg = await this.fetchIframe(ref, depth);
    if (!msg) return HtmlAttrFactory.EMPTY_RESULT;
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
    fnConsoleLog('IFrameFactory->computeIframe->END');
    return {
      html: `<iframe width="${width}" height="${height}" ${iframeAttr} data-pin-hash="${msg.data.hash}"></iframe>`,
      content: [{ hash: msg.data.hash, type: ObjContentTypeDto.IFRAME, content: msg.data }]
    };
  };

  private static fetchIframe = (ref: HTMLIFrameElement, depth: number): Promise<IFrameFetchMessage | undefined> => {
    return new Promise<IFrameFetchMessage | undefined>((resolve) => {
      const msg = IFrameStore.findIndex(ref);
      if (!msg) {
        if (ref.contentDocument) {
          setTimeout(async () => {
            const result = await this.fetchLocalIframe(ref, depth);
            resolve(result);
          }, 0);
        } else {
          fnConsoleLog('IFrameFactory->fetchIframe->findIndex->NOT_FOUND', ref, 'src', ref.src);
          resolve(undefined);
        }
        return;
      }
      fnConsoleLog('IFrameFactory->fetchIframe->index', msg.index, msg.uid, 'src', ref.src);

      const pingKey = TinyEventDispatcher.addListener<IFrameIndexMessage>(
        BusMessageType.IFRAME_PING_RESULT,
        (event, key, value) => {
          if (value.uid !== msg.uid) return;
          clearTimeout(iframePingTimeout);
          TinyEventDispatcher.removeListener(event, key);

          const fetchKey = TinyEventDispatcher.addListener<IFrameFetchMessage>(
            BusMessageType.IFRAME_FETCH_RESULT,
            (event, key, value) => {
              if (value.uid !== msg.uid) return;
              clearTimeout(iframeFetchTimeout);
              TinyEventDispatcher.removeListener(event, key);
              resolve(value);
            }
          );

          BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_FETCH, data: { ...msg, depth } })
            .then(() => {
              /* IGNORE*/
            })
            .catch(() => {
              /* IGNORE */
            });

          const iframeFetchTimeout = setTimeout(() => {
            fnConsoleLog('IFrameFactory->iframeFetchTimeout', msg.index, msg.uid, ref);
            TinyEventDispatcher.removeListener(BusMessageType.IFRAME_FETCH_RESULT, fetchKey);
            resolve(undefined);
          }, 20000);
        }
      );

      const iframePingTimeout = setTimeout(() => {
        fnConsoleLog('IFrameFactory->iframePingTimeout', msg.index, msg.uid, ref);
        TinyEventDispatcher.removeListener(BusMessageType.IFRAME_PING_RESULT, pingKey);
        resolve(undefined);
      }, 1000);

      BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_PING, data: msg })
        .then(() => {
          /* IGNORE*/
        })
        .catch(() => {
          /* IGNORE */
        });
    });
  };

  private static fetchLocalIframe = async (
    ref: HTMLIFrameElement,
    depth: number
  ): Promise<IFrameFetchMessage | undefined> => {
    if (!ref.contentDocument) return undefined;

    const htmlContent = await HtmlFactory.computeHtmlIntermediateData({
      ref: ref.contentDocument.body,
      depth: depth + 1,
      skipElements: [],
      skipUrlCache: new Set<string>(),
      skipTagCache: new Set<string>(),
      isPartial: false,
      insideLink: false
    });
    fnConsoleLog('ContentFetchAccessibleIframeCommand->html->done');
    const css = await CssFactory.computeCssContent(ref.contentDocument);
    fnConsoleLog('ContentFetchAccessibleIframeCommand->css->done');
    const data: ObjSnapshotContentDto = {
      hash: fnSha256(htmlContent.html),
      html: htmlContent.html,
      htmlAttr: HtmlFactory.computeHtmlAttr(),
      css,
      content: htmlContent.content
    };
    return {
      uid: fnUid(),
      href: '',
      data
    };
  };
}
