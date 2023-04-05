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
import { ContentVideoTime, HtmlIntermediateData } from '../../../common/model/html.model';
import { ObjContentDto, ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlConstraints } from './html.constraints';
import { IframeFactory } from './iframe.factory';
import { ShadowFactory } from './shadow.factory';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { environmentConfig } from '../../../common/environment';
import { fnComputeUrl } from '../../../common/fn/compute-url.fn';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnFetchImage } from '../../../common/fn/fetch-image.fn';
import { fnUid } from '../../../common/fn/uid.fn';

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
      videoTime: [],
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
      .map((a) => (a.nodeValue ? `${a.nodeName}=${a.nodeValue}` : `${a.nodeName}`))
      .join(' ');
  };

  static computeHtmlIntermediateData = async (ref: Element, depth = 1): Promise<HtmlIntermediateData> => {
    const tagName = ref.tagName.toLowerCase();
    if (!HtmlConstraints.KNOWN_ELEMENTS.includes(tagName)) {
      const shadow = BrowserApi.shadowRoot(ref);
      // Go with shadow
      if (shadow) {
        return ShadowFactory.computeShadow(tagName, ref, shadow);
      }
    }
    let html = `<${tagName} `;
    const videoTime: ContentVideoTime[] = [];
    const content: ObjContentDto[] = [];
    if (tagName === 'script' || tagName === 'link') return HtmlAttrFactory.EMPTY_RESULT;

    // IFRAME POC
    // TODO add iframe attributes and save as iframe and iframe content save separately
    if (tagName === 'iframe') {
      return await IframeFactory.computeIframe(ref as HTMLIFrameElement, depth);
    } else if (tagName === 'canvas') {
      try {
        return this.computeCanvas(ref as HTMLCanvasElement);
      } catch (e) {
        fnConsoleLog('COMPUTE CANVAS PROBLEM', e);
        return HtmlAttrFactory.EMPTY_RESULT;
      }
    } else if (tagName === 'video') {
      // fnConsoleLog('VIDEO !!!', (el as HTMLVideoElement).currentTime);
      videoTime.push({
        xpath: XpathFactory.newXPathString(ref as HTMLElement),
        currentTime: (ref as HTMLVideoElement).currentTime,
        displayTime: environmentConfig.settings.videoDisplayTime
      });
    } else if (tagName === 'img') {
      const value = await this.computeImgValue(ref as HTMLImageElement);
      const uid = fnUid();
      content.push({
        id: uid,
        type: ObjContentTypeDto.IMG,
        content: value
      });
      html += `data-pin-id=${uid} `;
    } else if (tagName === 'textarea') {
      html += `value="${(ref as HTMLTextAreaElement).value}" `;
    } else if (tagName === 'input' && (ref as HTMLInputElement).type !== 'password') {
      html += `value="${(ref as HTMLInputElement).value}" `;
    }

    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes));
    html = html.substring(0, html.length - 1) + '>';

    const nodes = Array.from(ref.childNodes);

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
        txt = txt.replace('<', '&lt').replace('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const computed = await this.computeHtmlIntermediateData(node as Element, depth);
        html += computed.html;
        videoTime.push(...computed.videoTime);
        content.push(...computed.content);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        // fnConsoleLog('fnComputeHtmlContent->skipping->COMMENT_NODE', node);
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }

    // Fix object element children
    if (ref instanceof HTMLObjectElement && ref.contentDocument) {
      const children = Array.from(ref.contentDocument.childNodes);
      for (const node of children) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const computed = await this.computeHtmlIntermediateData(node as Element, depth);
          html += computed.html;
        }
      }
    }

    html += `</${tagName}>`;

    return {
      html,
      videoTime,
      content
    };
  };

  private static computeImgValue = async (ref: HTMLImageElement): Promise<string> => {
    let value = ref.src || '';
    // we have data already inside image so just add it
    if (value.startsWith('data:')) {
      return value;
    }

    // fnConsoleLog('HtmlFactory->computeImgValue', ref.src);
    // data-src
    if (ref.getAttribute('data-src')) {
      value = ref.getAttribute('data-src') || '';
      const url = fnComputeUrl(value);
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        return imageData.res;
      }
    }

    // data-pin-media - maybe merge with data-src
    if (ref.getAttribute('data-pin-media')) {
      value = ref.getAttribute('data-pin-media') || '';
      const url = fnComputeUrl(value);
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        return imageData.res;
      }
    }

    // srcset
    if (ref.srcset) {
      // TODO check if ok for all cases - pick best image based on second parameter
      const srcset = ref.srcset.split(', ');
      // last value so it's biggest image
      value = srcset[srcset.length - 1].trim().split(' ')[0];
      const url = fnComputeUrl(value);
      if (url.startsWith('http')) {
        const imageData = await fnFetchImage(url);
        if (imageData.ok) {
          return imageData.res;
        }
      }
    }

    value = value.replaceAll('"', '&quot;');

    const url = fnComputeUrl(value);

    const imageData = await fnFetchImage(url);
    if (imageData.ok) {
      return imageData.res;
    }
    return url;
  };

  static computeHtmlParent = (parent: Element | null, content: string): string => {
    let data = content;
    while (parent && parent.tagName.toLowerCase() !== 'html') {
      const tagName = parent.tagName.toLowerCase();

      let value = `<${tagName} `;

      const attributes: Attr[] = Array.from(parent.attributes);
      for (const attr of attributes) {
        let attrValue = attr.value;
        attrValue = attrValue.replaceAll('"', '&quot;');
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
