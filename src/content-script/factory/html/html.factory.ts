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

  static computeHtmlIntermediateData = async (
    ref: Element,
    depth = 1,
    skipTagCache?: Set<string>
  ): Promise<HtmlIntermediateData> => {
    if (!skipTagCache) skipTagCache = new Set<string>();
    const tagName = ref.tagName.toLowerCase();
    if (!HtmlConstraints.KNOWN_ELEMENTS.includes(tagName) && !skipTagCache.has(tagName)) {
      const shadow = BrowserApi.shadowRoot(ref);
      // fnConsoleLog('NOT KNOWN ELEMENT', tagName, 'SHADOW', shadow);
      // Go with shadow
      if (shadow) {
        return ShadowFactory.computeShadow(tagName, ref, shadow);
      } else {
        skipTagCache.add(tagName);
      }
    }
    let html = `<${tagName} `;
    const video: ObjVideoDataDto[] = [];
    const content: ObjContentDto[] = [];
    if (tagName === 'script' || tagName === 'link') return HtmlAttrFactory.EMPTY_RESULT;

    // IFRAME POC
    // TODO add iframe attributes and save as iframe and iframe content save separately
    if (tagName === 'iframe') {
      return await IFrameFactory.computeIframe(ref as HTMLIFrameElement, depth);
    } else if (tagName === 'canvas') {
      try {
        return this.computeCanvas(ref as HTMLCanvasElement);
        // return HtmlAttrFactory.EMPTY_RESULT;
      } catch (e) {
        fnConsoleLog('COMPUTE CANVAS PROBLEM', e);
        return HtmlAttrFactory.EMPTY_RESULT;
      }
    } else if (tagName === 'video') {
      // fnConsoleLog('VIDEO !!!', (el as HTMLVideoElement).currentTime);
      video.push({
        xpath: XpathFactory.newXPathString(ref as HTMLElement),
        currentTime: (ref as HTMLVideoElement).currentTime,
        displayTime: environmentConfig.settings.videoDisplayTime
      });
    } else if (tagName === 'img') {
      const value = await HtmlImgFactory.computeImgValue(ref as HTMLImageElement);
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
        const computed = await this.computeHtmlIntermediateData(node as Element, depth, skipTagCache);
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
    if (ref instanceof HTMLObjectElement && ref.contentDocument) {
      const children = Array.from(ref.contentDocument.childNodes);
      for (const node of children) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const computed = await this.computeHtmlIntermediateData(node as Element, depth, skipTagCache);
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
