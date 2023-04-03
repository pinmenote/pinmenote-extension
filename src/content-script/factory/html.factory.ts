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
import { CSS_URL_REG, CssFactory } from './css.factory';
import { ContentVideoTime, HtmlIntermediateData } from '../../common/model/html.model';
import { ObjIframeContentDto, ObjIframeDataDto } from '../../common/model/obj/obj-iframe.dto';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { environmentConfig } from '../../common/environment';
import { fnComputeUrl } from '../../common/fn/compute-url.fn';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnFetchImage } from '../../common/fn/fetch-image.fn';
import { fnUid } from '../../common/fn/uid.fn';

export class HtmlFactory {
  private static EMPTY_RESULT = {
    html: '',
    videoTime: [],
    iframe: []
  };

  private static readonly KNOWN_ELEMENTS = [
    'a',
    'abbr',
    'acronym',
    'address',
    'applet',
    'area',
    'article',
    'aside',
    'audio',
    'a',
    'b',
    'base',
    'basefont',
    'bdo',
    'big',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'center',
    'cite',
    'code',
    'col',
    'colgroup',
    'datalist',
    'dd',
    'del',
    'dfn',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'font',
    'footer',
    'form',
    'frame',
    'frameset',
    'header',
    'head',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'p',
    'param',
    'pre',
    'progress',
    'q',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'source',
    'span',
    'strike',
    'strong',
    'style',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
    // SVG - not in HTML
    'animate',
    'animatemotion',
    'animatetransform',
    'circle',
    'clippath',
    'defs',
    'desc',
    'discard',
    'ellipse',
    'feblend',
    'fecolormatrix',
    'fecomponenttransfer',
    'fecomposite',
    'feconvolvematrix',
    'fediffuselighting',
    'fedisplacementmap',
    'fedistantlight',
    'fedropshadow',
    'feflood',
    'fefunca',
    'fefuncb',
    'fefuncg',
    'fefuncr',
    'fegaussianblur',
    'feimage',
    'femerge',
    'femergenode',
    'femorphology',
    'feoffset',
    'fepointlight',
    'fespecularlighting',
    'fespotlight',
    'fetile',
    'feturbulence',
    'filter',
    'foreignobject',
    'g',
    'hatch',
    'hatchpath',
    'image',
    'line',
    'lineargradient',
    'marker',
    'mask',
    'metadata',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialgradient',
    'rect',
    'set',
    'stop',
    'svg',
    'switch',
    'symbol',
    'text',
    'textpath',
    'tspan',
    'use',
    'view'
  ];

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
    return {
      html: `<img src="${imgData}" width="${width}" height="${height}" style="${style}" class="${clazz}" />`,
      videoTime: [],
      iframe: []
    };
  };

  static computeHtmlIntermediateData = async (ref: Element, depth = 1): Promise<HtmlIntermediateData> => {
    const tagName = ref.tagName.toLowerCase();
    if (!this.KNOWN_ELEMENTS.includes(tagName)) {
      const shadow = BrowserApi.shadowRoot(ref);
      // Go with shadow
      if (shadow) {
        let html = `<${tagName} `;
        html += await this.computeAttrValues(tagName, Array.from(ref.attributes));
        html = html.substring(0, html.length - 1) + '>';
        html += await this.computeShadowValue(shadow);
        html += `</${tagName}>`;
        fnConsoleLog('SHADOW !!!', html);
        return { html, videoTime: [], iframe: [] };
      }
    }
    let html = `<${tagName} `;
    const videoTime: ContentVideoTime[] = [];
    const iframe: ObjIframeDataDto[] = [];
    if (tagName === 'script' || tagName === 'link') return { html: '', videoTime: [], iframe: [] };

    // IFRAME POC
    // TODO add iframe attributes and save as iframe and iframe content save separately
    if (tagName === 'iframe') {
      return await this.computeIframe(ref as HTMLIFrameElement, depth);
    } else if (tagName === 'canvas') {
      try {
        return this.computeCanvas(ref as HTMLCanvasElement);
      } catch (e) {
        fnConsoleLog('COMPUTE CANVAS PROBLEM', e);
        return this.EMPTY_RESULT;
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
      html += `src="${value}" `;
    } else if (tagName === 'textarea') {
      html += `value="${(ref as HTMLTextAreaElement).value}" `;
    } else if (tagName === 'input' && (ref as HTMLInputElement).type !== 'password') {
      html += `value="${(ref as HTMLInputElement).value}" `;
    }

    html += await this.computeAttrValues(tagName, Array.from(ref.attributes));
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
        iframe.push(...computed.iframe);
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
      iframe
    };
  };

  private static computeShadowValue = async (ref: ShadowRoot): Promise<string> => {
    const nodes = Array.from(ref.childNodes);
    let html = '';
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
        txt = txt.replace('<', '&lt').replace('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        html += await this.computeShadowChild(node as Element);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        // fnConsoleLog('fnComputeHtmlContent->skipping->COMMENT_NODE', node);
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }
    return html;
  };

  private static computeShadowChild = async (ref: Element): Promise<string> => {
    const tagName = ref.tagName.toLowerCase();
    if (tagName === 'link') {
      const uri = ref.getAttribute('href');
      if (uri) {
        const url = fnComputeUrl(uri);
        // fnConsoleLog('computeShadowChild->link', url);
        const css = await CssFactory.fetchCss(url);
        if (css.ok) {
          return `<style>${css.res}</style>`;
        } else {
          fnConsoleLog('computeShadowChild->link->error', css);
        }
      }
    }
    if (!this.KNOWN_ELEMENTS.includes(tagName)) {
      const shadow = BrowserApi.shadowRoot(ref);
      if (shadow) {
        let html = `<${tagName} `;
        html += await this.computeAttrValues(tagName, Array.from(ref.attributes));
        html = html.substring(0, html.length - 1) + '>';
        html += await this.computeShadowValue(shadow);
        html += `</${tagName}>`;
        return html;
      }
    }
    let html = `<${tagName} `;
    html += await this.computeAttrValues(tagName, Array.from(ref.attributes));
    html = html.substring(0, html.length - 1) + '>';

    const nodes = Array.from(ref.childNodes);
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
        txt = txt.replace('<', '&lt').replace('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        html += await this.computeShadowChild(node as Element);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        // fnConsoleLog('fnComputeHtmlContent->skipping->COMMENT_NODE', node);
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }

    html += `</${tagName}>`;
    return html;
  };

  private static computeAttrValues = async (tagName: string, attributes: Attr[]): Promise<string> => {
    let html = '';
    let hrefFilled = false;
    for (const attr of attributes) {
      let attrValue = attr.value;
      attrValue = attrValue.replaceAll('"', '&quot;');
      // value for input, textarea filled outside loop
      if ((tagName === 'input' || tagName === 'textarea') && attr.name === 'value') continue;

      if (attr.name === 'href' && !hrefFilled) {
        // HREF
        const url = fnComputeUrl(attrValue);
        html += `href="${url}" `;
        html += `target="_blank" `;
        hrefFilled = true;
      } else if (attr.name === 'target') {
        // Skip - we handle it inside href
      } else if (attr.name === 'srcset' && tagName === 'img') {
        // skip image
      } else if (attr.name === 'src') {
        //  skip image
        if (tagName === 'img') continue;
        const url = fnComputeUrl(attrValue);
        html += `src="${url}" `;
      } else if (attr.name === 'data-iframe') {
        if (tagName === 'a' && !hrefFilled) {
          try {
            const dataJSON = window.atob(attrValue);

            const url: string = JSON.parse(dataJSON).src;
            if (url.startsWith('http')) {
              html += `href="${url}" `;
              html += `target="_blank" `;
              hrefFilled = true;
            }
          } catch (e) {
            fnConsoleLog('HtmlFactory->computeHtmlIntermediateData->Error', e);
          }
        }
      } else if (attr.name === 'style') {
        // style can have background-image:url('')
        const urlList = attrValue.match(CSS_URL_REG);
        if (urlList) {
          const value = await CssFactory.fetchUrls(attrValue);
          fnConsoleLog(
            'HtmlFactory->computeHtmlIntermediateData->image-inside-style',
            'prev',
            attrValue,
            'result',
            value
          );
          html += `${attr.name}="${value}" `;
        } else {
          html += `${attr.name}="${attrValue}" `;
        }
      } else if (attrValue) {
        html += `${attr.name}="${attrValue}" `;
      } else {
        html += `${attr.name} `;
      }
    }
    return html;
  };

  private static computeIframe = async (ref: HTMLIFrameElement, depth: number): Promise<HtmlIntermediateData> => {
    // Skip iframe->iframe->skip
    if (depth > 3) return this.EMPTY_RESULT;
    try {
      const html = await this.fetchIframe(ref, depth);
      if (!html.ok) return this.EMPTY_RESULT;
      fnConsoleLog('IFRAME !!!', ref.id, html);
      const uid = fnUid();
      const width = ref.getAttribute('width') || '100%';
      const height = ref.getAttribute('width') || '100%';
      const style = ref.getAttribute('style') || '';
      const clazz = ref.getAttribute('class') || '';
      return {
        html: `<iframe width="${width}" height="${height}" style="${style}" class="${clazz}" id="${uid}"></iframe>`,
        videoTime: [],
        iframe: [{ uid, html }]
      };
    } catch (e) {
      fnConsoleLog('HtmlFactory->computeIframe->Error', e);
    }
    return this.EMPTY_RESULT;
  };

  private static computeImgValue = async (ref: HTMLImageElement): Promise<string> => {
    let value = '';
    value = ref.src || '';
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

  private static fetchIframe = (ref: HTMLIFrameElement, depth: number): Promise<ObjIframeContentDto> => {
    fnConsoleLog('HtmlFactory->fetchIframe', ref.src);
    return new Promise<ObjIframeContentDto>((resolve, reject) => {
      if (!ref.contentWindow) return HtmlFactory.EMPTY_RESULT;
      TinyEventDispatcher.addListener<{ id: string }>(BusMessageType.CONTENT_FETCH_IFRAME_PING, (event, key, value) => {
        fnConsoleLog('HtmlFactory->fetchIframe->ping->clear', value.id, ref.id);
        if (value.id === ref.id) {
          TinyEventDispatcher.removeListener(event, key);
          clearTimeout(iframeTimeout);
        }
      });
      const eventKey = TinyEventDispatcher.addListener<ObjIframeContentDto>(
        BusMessageType.CONTENT_FETCH_IFRAME_RESULT,
        (event, key, value) => {
          if (value.id === ref.id) {
            fnConsoleLog('HtmlFactory->fetchIframe->result', ref.id, value.url, value);
            clearTimeout(iframeTimeout);
            TinyEventDispatcher.removeListener(event, eventKey);
            resolve(value);
          }
        }
      );
      ref.contentWindow.postMessage(`{"foo":"bar", "depth":${depth}, "id":"${ref.id}"}`, '*');
      const iframeTimeout = setTimeout(() => {
        TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IFRAME_RESULT, eventKey);
        reject(`Iframe timeout ${ref.id} ${ref.src}`);
      }, 1000);
    });
  };
}
