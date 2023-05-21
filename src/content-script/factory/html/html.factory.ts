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
import { HtmlIntermediateData } from '../../model/html.model';
import { HtmlPictureFactory } from './html-picture.factory';
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

type CtxName = '2d' | 'webgl' | 'webgl2';

const findContext = (ref: HTMLCanvasElement): { ctx: RenderingContext | null; name: CtxName } => {
  let name: CtxName = '2d';
  let ctx: RenderingContext | null = ref.getContext(name);
  if (!ctx) name = 'webgl';
  ctx = ref.getContext(name, { preserveDrawingBuffer: true });
  if (!ctx) name = 'webgl2';
  ctx = ref.getContext(name, { preserveDrawingBuffer: true });
  return { ctx, name };
};

export class HtmlFactory {
  static computeCanvas = (ref: HTMLCanvasElement): HtmlIntermediateData => {
    fnConsoleLog('HtmlFactory->computeCanvas');
    const uid = fnUid();
    let html = `<img data-pin-id="${uid}" `;

    let imgData = '';
    const render = findContext(ref);

    if (render.ctx) {
      switch (render.name) {
        case '2d':
          imgData = ref.toDataURL('image/png', 80);
          break;
        case 'webgl':
        case 'webgl2': {
          const gl = render.ctx as WebGLRenderingContext;
          if (gl.getContextAttributes()?.preserveDrawingBuffer) {
            imgData = ref.toDataURL('image/png', 80);
            fnConsoleLog('HtmlFactory->computeCanvas->preserveDrawingBuffer', true);
          } else {
            fnConsoleLog('HtmlFactory->computeCanvas->preserveDrawingBuffer', false);
            /* TODO capture webgl texture without preserveDrawingBuffer
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            const empty1x1 = new Uint8Array([1, 1, 1, 1]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, empty1x1);
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D, texture, 0);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {

            }*/
            const can = document.createElement('canvas');
            const empty1x1 = new Uint8Array([1, 1, 1, 1]);
            const img = new ImageData(Uint8ClampedArray.from(empty1x1), 1, 1);
            const ctx = can.getContext('2d');
            if (ctx) {
              ctx.putImageData(img, 0, 0);
            }
            imgData = can.toDataURL('image/png', 80);
          }
        }
      }
    }

    let width = ref.getAttribute('width');
    let height = ref.getAttribute('height');

    if (!width || !height) {
      const rect1 = ref.parentElement?.getBoundingClientRect();
      const rect2 = ref.getBoundingClientRect();
      width = Math.max(rect1?.width || 0, rect2.width).toString() || '100%';
      height = Math.max(rect1?.height || 0, rect2.height).toString() || '100%';
    }
    html += `width="${width}" height="${height}" `;

    const style = ref.getAttribute('style') || '';
    if (style) html += `style="${style}" `;

    const clazz = ref.getAttribute('class') || '';
    if (clazz) html += `class="${clazz}" `;

    html += `/>`;

    return {
      html,
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
    if (['script', 'link', 'noscript', 'style'].includes(tagName)) return HtmlAttrFactory.EMPTY_RESULT;

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
      return await HtmlPictureFactory.computePicture(params.ref as HTMLPictureElement, false, params.skipUrlCache);
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
      const value = (params.ref as HTMLTextAreaElement).value.replaceAll('"', '&quot;');
      html += `value="${value}" `;
    } else if (tagName === 'input' && (params.ref as HTMLInputElement).type !== 'password') {
      const value = (params.ref as HTMLInputElement).value.replaceAll('"', '&quot;');
      html += `value="${value}" `;
    }

    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(params.ref.attributes));
    html = html.substring(0, html.length - 1) + '>';

    const nodes = Array.from(params.ref.childNodes);

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replaceAll(nre, '&nbsp;') : '';
        txt = txt.replaceAll('<', '&lt').replaceAll('>', '&gt;');
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
