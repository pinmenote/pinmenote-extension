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
import { HtmlConstraints, HtmlSkipAttribute } from './html.constraints';
import { ObjContentDto, ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { CssFactory } from '../css.factory';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlImgFactory } from './html-img.factory';
import { HtmlIntermediateData } from '../../model/html.model';
import { HtmlPictureFactory } from './html-picture.factory';
import { HtmlVideoFactory } from './html-video.factory';
import { IFrameFactory } from './iframe.factory';
import { ShadowFactory } from './shadow.factory';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export interface HtmlComputeParams {
  ref: Element;
  depth: number;
  skipAttributes: HtmlSkipAttribute[];
  skipTagCache: Set<string>;
  skipUrlCache: Set<string>;
  isPartial: boolean;
  insideLink: boolean; // detect and mitigate link inside link hacks inside html generators
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

    const hash = fnSha256(imgData);

    let html = `<img data-pin-hash="${hash}" width="${width}" height="${height}" `;

    const style = ref.getAttribute('style') || '';
    if (style) html += `style="${style}" `;

    const clazz = ref.getAttribute('class') || '';
    if (clazz) html += `class="${clazz}" `;

    html += `/>`;
    return {
      html,
      content: [
        {
          hash,
          type: ObjContentTypeDto.IMG,
          content: imgData
        }
      ]
    };
  };

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
        return ShadowFactory.computeShadow(tagName, params.ref, shadow, params.skipUrlCache);
      } else {
        params.skipTagCache.add(tagName);
      }
    }

    const content: ObjContentDto[] = [];

    let html = `<${tagName} `;

    // IFRAME POC
    switch (tagName) {
      case 'svg': {
        // TODO review it's ok
        html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(params.ref.attributes));
        return {
          html: `${html.trimEnd()}>${params.ref.innerHTML}</svg>`,
          content
        };
      }
      case 'video': {
        return HtmlVideoFactory.captureVideo(params.ref as HTMLVideoElement);
      }
      case 'iframe': {
        return await IFrameFactory.computeIframe(params.ref as HTMLIFrameElement, params.depth);
      }
      case 'canvas': {
        try {
          return this.computeCanvas(params.ref as HTMLCanvasElement);
        } catch (e) {
          fnConsoleLog('COMPUTE CANVAS PROBLEM', e, params, depth);
          return HtmlAttrFactory.EMPTY_RESULT;
        }
      }
      case 'picture': {
        return await HtmlPictureFactory.computePicture(params.ref as HTMLPictureElement, false, params.skipUrlCache);
      }
      case 'img': {
        const value = await HtmlImgFactory.computeImgValue(params.ref as HTMLImageElement, params.skipUrlCache);
        const hash = fnSha256(value);
        content.push({
          hash,
          type: ObjContentTypeDto.IMG,
          content: value
        });
        html += `data-pin-hash="${hash}" `;
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
          const css = await CssFactory.fetchUrls(params.ref.textContent);
          return {
            html: `<style>${css}</style>`,
            content: []
          };
        }
        return HtmlAttrFactory.EMPTY_RESULT;
      }
    }

    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(params.ref.attributes));
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
            skipAttributes: params.skipAttributes,
            skipTagCache: params.skipTagCache,
            skipUrlCache: params.skipUrlCache,
            isPartial: params.isPartial,
            insideLink: tagName === 'a' || params.insideLink
          },
          depth++
        );
        html += computed.html;
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
            skipAttributes: params.skipAttributes,
            skipTagCache: params.skipTagCache,
            skipUrlCache: params.skipUrlCache,
            isPartial: params.isPartial,
            insideLink: tagName === 'a' || params.insideLink
          });
          html += computed.html;
        }
      }
    }

    html += `</${tagName}>`;

    return {
      html,
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
