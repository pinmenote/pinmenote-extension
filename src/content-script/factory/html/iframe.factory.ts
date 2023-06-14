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
import { HtmlComputeParams, HtmlIntermediateData } from '../../model/html.model';
import { IFrameFetchMessage, IFrameIndexMessage } from '../../../common/model/iframe-message.model';
import { SegmentPageDto, SegmentTypeDto } from '../../../common/model/obj/page-segment.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { CssFactory } from '../css.factory';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlFactory } from './html.factory';
import { IFrameStore } from '../../store/iframe.store';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class IFrameFactory {
  static computeIframe = async (params: HtmlComputeParams): Promise<HtmlIntermediateData> => {
    fnConsoleLog('IFrameFactory->computeIframe->START');
    // Skip iframe->iframe->skip
    if (params.depth > 3) return HtmlAttrFactory.EMPTY_RESULT;
    const msg = await this.fetchIframe(params);
    if (!msg) return HtmlAttrFactory.EMPTY_RESULT;
    const width = params.ref.getAttribute('width') || '100%';
    const height = params.ref.getAttribute('height') || '100%';
    const iframeAttr = Array.from(params.ref.attributes)
      .map((a) => {
        if (['width', 'height', 'src'].includes(a.nodeName)) return '';
        if (a.nodeValue) {
          return `${a.nodeName}="${a.nodeValue}"`;
        }
        return a.nodeName;
      })
      .join(' ');
    fnConsoleLog('IFrameFactory->computeIframe->END');
    params.contentCallback({ hash: msg.data.html.hash, type: SegmentTypeDto.IFRAME, content: msg.data });
    return {
      html: `<iframe width="${width}" height="${height}" ${iframeAttr} 
data-pin-hash="${msg.data.html.hash}" data-pin-iframe-index="${msg.index}" data-pin-iframe-href="${msg.href}"></iframe>`,
      assets: [msg.data.html.hash]
    };
  };

  private static fetchIframe = (params: HtmlComputeParams): Promise<IFrameFetchMessage | undefined> => {
    return new Promise<IFrameFetchMessage | undefined>((resolve) => {
      const ref = params.ref as HTMLIFrameElement;
      const msg = IFrameStore.findIndex(ref);
      if (!msg) {
        if (ref.contentDocument) {
          setTimeout(async () => {
            const result = await this.fetchLocalIframe(params);
            resolve(result);
          }, 0);
        } else {
          fnConsoleLog('IFrameFactory->fetchIframe->findIndex->NOT_FOUND', ref, 'src', ref.src);
          resolve(undefined);
        }
        return;
      }
      fnConsoleLog('IFrameFactory->fetchIframe->index', msg.index, msg.uid, 'src', ref.src);

      const pingKey = TinyDispatcher.addListener<IFrameIndexMessage>(
        BusMessageType.IFRAME_PING_RESULT,
        (event, key, value) => {
          if (value.uid !== msg.uid) return;
          clearTimeout(iframePingTimeout);
          TinyDispatcher.removeListener(event, key);

          const fetchKey = TinyDispatcher.addListener<IFrameFetchMessage>(
            BusMessageType.IFRAME_FETCH_RESULT,
            (event, key, value) => {
              if (value.uid !== msg.uid) return;
              clearTimeout(iframeFetchTimeout);
              TinyDispatcher.removeListener(event, key);
              resolve(value);
            }
          );

          BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_FETCH, data: { ...msg, depth: params.depth } })
            .then(() => {
              /* IGNORE*/
            })
            .catch(() => {
              /* IGNORE */
            });

          const iframeFetchTimeout = setTimeout(() => {
            fnConsoleLog('IFrameFactory->iframeFetchTimeout', msg.index, msg.uid, ref);
            TinyDispatcher.removeListener(BusMessageType.IFRAME_FETCH_RESULT, fetchKey);
            resolve(undefined);
          }, 20000);
        }
      );

      const iframePingTimeout = setTimeout(() => {
        fnConsoleLog('IFrameFactory->iframePingTimeout', msg.index, msg.uid, ref);
        TinyDispatcher.removeListener(BusMessageType.IFRAME_PING_RESULT, pingKey);
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

  private static fetchLocalIframe = async (params: HtmlComputeParams): Promise<IFrameFetchMessage | undefined> => {
    const ref = params.ref as HTMLIFrameElement;
    if (!ref.contentDocument) return undefined;

    const htmlContent = await HtmlFactory.computeHtmlIntermediateData({
      ...params,
      ref: ref.contentDocument.body
    });
    fnConsoleLog('ContentFetchAccessibleIframeCommand->html->done');
    const css = await CssFactory.computeCssContent(ref.contentDocument, params);
    fnConsoleLog('ContentFetchAccessibleIframeCommand->css->done');

    const data: SegmentPageDto = {
      html: {
        hash: fnSha256(htmlContent.html),
        html: htmlContent.html,
        htmlAttr: HtmlFactory.computeHtmlAttr()
      },
      css,
      assets: htmlContent.assets
    };

    return {
      index: '-',
      uid: fnSha256(htmlContent.html),
      href: '',
      data
    };
  };
}
