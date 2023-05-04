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
import { ObjContentDto, ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlConstraints } from './html.constraints';
import { HtmlImgFactory } from './html-img.factory';
import { HtmlIntermediateData } from '../../../common/model/html.model';
import { IFrameFactory } from './iframe.factory';
import { ObjVideoDataDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ShadowFactory } from './shadow.factory';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnUid } from '../../../common/fn/uid.fn';

export interface HtmlComputeParams {
  ref: Element;
  depth: number;
  skipTagCache: Set<string>;
  skipUrlCache: Set<string>;
  isPartial: boolean;
}

export class HtmlFactory {
  static computeCanvas = (ref: HTMLCanvasElement): HtmlIntermediateData => {
    const imgData = ref.toDataURL('image/png', 80);
    fnConsoleLog('HtmlFactory->computeCanvas');
    let width = ref.getAttribute('width') || '100%';
    let height = ref.getAttribute('height') || '100%';
    const rect = ref.parentElement?.getBoundingClientRect();
    if (rect) {
      width = `${rect.width}px`;
      height = `${rect.height}px`;
    }
    const style = ref.getAttribute('style') || '';
    const clazz = ref.getAttribute('class') || '';
    const uid = fnUid();
    return {
      html: `<img data-pin-id="${uid}" width="${width}" height="${height}" style="${style}" class="${clazz}" />`,
      video: [],
      content: [
        {
          id: uid,
          type: ObjContentTypeDto.IMG,
          content: imgData
        }
      ]
    };
  };

  static computeHtmlAttr = (): string => {
    return Array.from(document.getElementsByTagName('html')[0].attributes)
      .map((a) => (a.nodeValue ? `${a.nodeName}="${a.nodeValue}"` : `${a.nodeName}`))
      .join(' ');
  };

  static computeHtmlIntermediateData = async (params: HtmlComputeParams): Promise<HtmlIntermediateData> => {
    const tagName = params.ref.tagName.toLowerCase();
    if (['script', 'link', 'noscript'].includes(tagName)) return HtmlAttrFactory.EMPTY_RESULT;

    if (!HtmlConstraints.KNOWN_ELEMENTS.includes(tagName) && !params.skipTagCache.has(tagName)) {
      const shadow = BrowserApi.shadowRoot(params.ref);
      // Go with shadow
      if (shadow) {
        return ShadowFactory.computeShadow(tagName, params.ref, shadow, params.skipUrlCache);
      } else {
        params.skipTagCache.add(tagName);
      }
    }

    const video: ObjVideoDataDto[] = [];
    const content: ObjContentDto[] = [];

    let html = `<${tagName} `;

    // IFRAME POC
    if (tagName === 'iframe') {
      return await IFrameFactory.computeIframe(params.ref as HTMLIFrameElement, params.depth);
    } else if (tagName === 'canvas') {
      try {
        return this.computeCanvas(params.ref as HTMLCanvasElement);
      } catch (e) {
        fnConsoleLog('COMPUTE CANVAS PROBLEM', e);
        return HtmlAttrFactory.EMPTY_RESULT;
      }
    } else if (tagName === 'video') {
      // fnConsoleLog('VIDEO !!!', (el as HTMLVideoElement).currentTime);
      video.push({
        xpath: XpathFactory.newXPathString(params.ref as HTMLElement),
        currentTime: (params.ref as HTMLVideoElement).currentTime,
        displayTime: environmentConfig.settings.videoDisplayTime
      });
    } else if (tagName === 'picture') {
      return await this.computePicture(params.ref as HTMLPictureElement, false, params.skipUrlCache);
    } else if (tagName === 'img') {
      const value = await HtmlImgFactory.computeImgValue(params.ref as HTMLImageElement, params.skipUrlCache);
      const uid = fnUid();
      content.push({
        id: uid,
        type: ObjContentTypeDto.IMG,
        content: value
      });
      html += `data-pin-id=${uid} `;
    } else if (tagName === 'textarea') {
      html += `value="${(params.ref as HTMLTextAreaElement).value}" `;
    } else if (tagName === 'input' && (params.ref as HTMLInputElement).type !== 'password') {
      html += `value="${(params.ref as HTMLInputElement).value}" `;
    }

    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(params.ref.attributes));
    html = html.substring(0, html.length - 1) + '>';

    const nodes = Array.from(params.ref.childNodes);

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
        txt = txt.replace('<', '&lt').replace('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const computed = await this.computeHtmlIntermediateData({
          ref: node as Element,
          depth: params.depth,
          skipTagCache: params.skipTagCache,
          skipUrlCache: params.skipUrlCache,
          isPartial: params.isPartial
        });
        html += computed.html;
        video.push(...computed.video);
        content.push(...computed.content);
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
            skipTagCache: params.skipTagCache,
            skipUrlCache: params.skipUrlCache,
            isPartial: params.isPartial
          });
          html += computed.html;
        }
      }
    }

    html += `</${tagName}>`;

    return {
      html,
      video,
      content
    };
  };

  static computePicture = async (
    ref: HTMLPictureElement,
    forShadow: boolean,
    skipUrlCache?: Set<string>
  ): Promise<HtmlIntermediateData> => {
    if (!ref.firstElementChild) return HtmlAttrFactory.EMPTY_RESULT;

    const children = Array.from(ref.children);
    const img = children.filter((c) => c.tagName.toLowerCase() === 'img').pop();
    const sources = children.filter((c) => c.tagName.toLowerCase() === 'source');

    const content: ObjContentDto[] = [];
    let html = `<picture `;
    html += await HtmlAttrFactory.computeAttrValues('picture', Array.from(ref.attributes));
    html = html.substring(0, html.length - 1);

    // Source must be converted to img - we lose size information that's why we need to put style with those attributes
    html += '>';
    let child = sources.shift();
    while (child) {
      if (child.getAttribute('src') || child.getAttribute('srcset')) {
        break;
      }
      child = sources.shift();
    }
    let value = '';
    if (child) {
      value = await HtmlImgFactory.computeImgValue(child as HTMLImageElement, skipUrlCache);
    } else {
      value = await HtmlImgFactory.computeImgValue(img as HTMLImageElement, skipUrlCache);
    }
    const uid = fnUid();
    if (forShadow) {
      html += `<img src="${value}" `;
    } else {
      html += `<img data-pin-id=${uid} `;
      content.push({
        id: uid,
        type: ObjContentTypeDto.IMG,
        content: value
      });
    }
    if (!child) {
      const imgAttr = Array.from(img.attributes);
      html += await HtmlAttrFactory.computeAttrValues('img', imgAttr);
    } else {
      const imgAttr = Array.from(child.attributes);
      html += await HtmlAttrFactory.computeAttrValues('img', imgAttr);
      if (img) {
        const rect = img.getBoundingClientRect();
        let w = parseInt(img.getAttribute('width') || '0');
        let h = parseInt(img.getAttribute('height') || '0');
        if (rect.height > h) {
          w = rect.width;
          h = rect.height;
        }
        html += `width="${w}" height="${h}" `;
      }
    }
    html = html.substring(0, html.length - 1) + '/>';
    html += '</picture>';
    return {
      html,
      video: [],
      content
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
