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
import { BrowserApi } from '@pinmenote/browser-api';
import { CssFactory } from '../css.factory';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlCanvasFactory } from './html-canvas.factory';
import { HtmlConstraints } from './html.constraints';
import { HtmlImgFactory } from './html-img.factory';
import { HtmlPictureFactory } from './html-picture.factory';
import { HtmlVideoFactory } from './html-video.factory';
import { IFrameFactory } from './iframe.factory';
import { SegmentTypeDto } from '../../../common/model/obj/page-segment.dto';
import { ShadowFactory } from './shadow.factory';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class HtmlFactory {
  static computeHtmlAttr = (): string => {
    return Array.from(document.getElementsByTagName('html')[0].attributes)
      .map((a) => (a.nodeValue ? `${a.nodeName}="${a.nodeValue.replaceAll('"', '&quot;')}"` : `${a.nodeName}`))
      .join(' ');
  };

  static computeHtmlIntermediateData = async (params: HtmlComputeParams, depth = 1): Promise<HtmlIntermediateData> => {
    let tagName = params.ref.tagName.toLowerCase();
    if (['script', 'link', 'noscript'].includes(tagName)) return HtmlAttrFactory.EMPTY_RESULT;

    // skip those
    if (
      params.skipAttributes.filter((attr) => {
        return params.ref.getAttribute(attr.key) === attr.value;
      }).length > 0
    ) {
      return HtmlAttrFactory.EMPTY_RESULT;
    }

    // @vane wasted whole day fixing html rendering problem
    // just because some most popular markdown to documentation
    // company that has git version control system in their name followed by book breaks html specification
    if (tagName === 'a' && params.insideLink) tagName = 'div';

    if (!HtmlConstraints.KNOWN_ELEMENTS.includes(tagName) && !params.skipTagCache.has(tagName)) {
      const shadow = BrowserApi.shadowRoot(params.ref);
      // Go with shadow
      if (shadow) {
        return ShadowFactory.computeShadow(tagName, shadow, params);
      } else {
        params.skipTagCache.add(tagName);
      }
    }

    const assets: string[] = [];

    let html = `<${tagName} `;

    // IFRAME POC
    switch (tagName) {
      case 'svg': {
        // TODO review it's ok
        html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(params.ref.attributes), params);
        return {
          html: `${html.trimEnd()}>${params.ref.innerHTML}</svg>`,
          assets
        };
      }
      case 'video': {
        try {
          return HtmlVideoFactory.captureVideo(params);
        } catch (e) {
          fnConsoleLog('COMPUTE VIDEO CANVAS PROBLEM', e, params, depth);
          return HtmlAttrFactory.EMPTY_RESULT;
        }
      }
      case 'iframe': {
        return await IFrameFactory.computeIframe(params);
      }
      case 'canvas': {
        try {
          return HtmlCanvasFactory.computeCanvas(params);
        } catch (e) {
          fnConsoleLog('COMPUTE CANVAS PROBLEM', e, params, depth);
          return HtmlAttrFactory.EMPTY_RESULT;
        }
      }
      case 'picture': {
        return await HtmlPictureFactory.computePicture(params.ref as HTMLPictureElement, false, params);
      }
      case 'img': {
        const value = await HtmlImgFactory.computeImgValue(params.ref as HTMLImageElement, params);
        if (!value) break;
        const hash = fnSha256(value);
        html += `data-pin-hash="${hash}" `;
        assets.push(hash);
        params.contentCallback({
          hash,
          type: SegmentTypeDto.IMG,
          content: {
            src: value
          }
        });
        break;
      }
      case 'textarea': {
        const value = (params.ref as HTMLTextAreaElement).value.replaceAll('"', '&quot;');
        html += `value="${value}" `;
        break;
      }
      case 'input': {
        if ((params.ref as HTMLInputElement).type !== 'password') {
          const value = (params.ref as HTMLInputElement).value.replaceAll('"', '&quot;');
          html += `value="${value}" `;
        }
        break;
      }
      case 'style': {
        if (params.ref.textContent) {
          const css = await CssFactory.fetchUrls(params.ref.textContent, params);
          return {
            html: `<style>${css}</style>`,
            assets: []
          };
        }
        return HtmlAttrFactory.EMPTY_RESULT;
      }
    }

    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(params.ref.attributes), params);
    html = html.trimEnd() + '>';

    const nodes = Array.from(params.ref.childNodes);

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replaceAll(nre, '&nbsp;') : '';
        txt = txt.replaceAll('<', '&lt').replaceAll('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const computed = await this.computeHtmlIntermediateData(
          {
            ref: node as Element,
            depth: params.depth,
            visitedUrl: params.visitedUrl,
            skipAttributes: params.skipAttributes,
            skipTagCache: params.skipTagCache,
            skipUrlCache: params.skipUrlCache,
            isPartial: params.isPartial,
            insideLink: tagName === 'a' || params.insideLink,
            contentCallback: params.contentCallback
          },
          depth++
        );
        html += computed.html;
        assets.push(...computed.assets);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        html += '<!---->';
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }

    // Fix object element children
    if (params.ref instanceof HTMLObjectElement && params.ref.contentDocument) {
      const children = Array.from(params.ref.contentDocument.childNodes);
      for (const node of children) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const computed = await this.computeHtmlIntermediateData({
            ref: node as Element,
            depth: params.depth,
            visitedUrl: params.visitedUrl,
            skipAttributes: params.skipAttributes,
            skipTagCache: params.skipTagCache,
            skipUrlCache: params.skipUrlCache,
            isPartial: params.isPartial,
            insideLink: tagName === 'a' || params.insideLink,
            contentCallback: params.contentCallback
          });
          html += computed.html;
        }
      }
    }

    html += `</${tagName}>`;

    return {
      html,
      assets: assets
    };
  };

  static computeHtmlParent = (parent: Element | null, content: string, isPartial = false): string => {
    let data = content;
    while (parent && parent.tagName.toLowerCase() !== 'html') {
      const tagName = parent.tagName.toLowerCase();

      let value = `<${tagName} `;

      const attributes: Attr[] = Array.from(parent.attributes);
      for (const attr of attributes) {
        let attrValue = attr.value;
        attrValue = attrValue.replaceAll('"', '&quot;');
        if (attr.name === 'style' && isPartial) {
          attrValue = HtmlAttrFactory.cutPartialStyles(attrValue);
        }
        if (attrValue) {
          value += `${attr.name}="${attrValue}" `;
        } else {
          value += `${attr.name} `;
        }
      }
      value += `>${data}</${tagName}>`;

      data = value;
      parent = parent.parentElement;
    }
    return data;
  };
}
