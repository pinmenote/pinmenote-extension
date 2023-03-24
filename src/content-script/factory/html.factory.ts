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
import { ContentVideoTime, HtmlIntermediateData } from '../../common/model/html.model';
import { ObjIframeContentDto, ObjIframeDataDto } from '../../common/model/obj/obj-iframe.dto';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { CssFactory } from './css.factory';
import { FetchImageRequest } from '../../common/model/obj-request.model';
import { FetchResponse } from '../../common/model/api.model';
import { ObjUrlDto } from '../../common/model/obj/obj.dto';
import { PinHtmlDataDto } from '../../common/model/obj/obj-pin.dto';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { UrlFactory } from '../../common/factory/url.factory';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { environmentConfig } from '../../common/environment';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnUid } from '../../common/fn/uid.fn';

export class HtmlFactory {
  static async computeHtmlData(ref: HTMLElement, url?: ObjUrlDto): Promise<PinHtmlDataDto> {
    const htmlContent = await this.computeHtmlIntermediateData(ref);
    const html = HtmlFactory.computeHtmlParent(ref.parentElement, htmlContent.html);

    fnConsoleLog('START COMPUTE CSS !!!');
    const css = await CssFactory.computeCssContent();
    fnConsoleLog('STOP COMPUTE CSS !!!');
    const rect = XpathFactory.computeRect(ref);
    const screenshot = await ScreenshotFactory.takeScreenshot(rect, url);
    return {
      title: document.title,
      screenshot,
      html,
      css,
      border: {
        style: ref.style.border,
        radius: ref.style.borderRadius
      }
    };
  }

  static computeIframe = async (ref: Element): Promise<HtmlIntermediateData> => {
    const url = UrlFactory.normalizeHref((ref as HTMLIFrameElement).src);
    const html = await this.fetchIframe(url);
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
  };

  static computeHtmlIntermediateData = async (ref: Element): Promise<HtmlIntermediateData> => {
    const tagName = ref.tagName.toLowerCase();
    let html = `<${tagName} `;
    const videoTime: ContentVideoTime[] = [];
    const iframe: ObjIframeDataDto[] = [];
    if (tagName === 'script') return { html: '', videoTime: [], iframe: [] };

    // IFRAME POC
    // TODO add iframe attributes and save as iframe and iframe content save separately
    if (tagName === 'iframe') {
      return this.computeIframe(ref);
    }

    if (tagName === 'video') {
      // fnConsoleLog('VIDEO !!!', (el as HTMLVideoElement).currentTime);
      videoTime.push({
        xpath: XpathFactory.newXPathString(ref as HTMLElement),
        currentTime: (ref as HTMLVideoElement).currentTime,
        displayTime: environmentConfig.settings.videoDisplayTime
      });
    }

    if (tagName === 'img') {
      const value = await this.computeImgValue(ref);
      html += `src="${value}" `;
    }

    const attributes: Attr[] = Array.from(ref.attributes);
    let hrefFilled = false;
    for (const attr of attributes) {
      let attrValue = attr.value;
      attrValue = attrValue.replaceAll('"', '&quot;');

      if (attr.name === 'href' && !hrefFilled) {
        // HREF
        const url = this.computeUrl(attrValue);
        html += `href="${url}" `;
        html += `target="_blank" `;
        hrefFilled = true;
      } else if (attr.name === 'target') {
        // Skip - we handle it inside href
      } else if (attr.name === 'src' && tagName !== 'img') {
        const url = this.computeUrl(attrValue);
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
            fnConsoleLog('computeHtmlIntermediateData->Error', e);
          }
        }
      } else if (attrValue) {
        html += `${attr.name}="${attrValue}" `;
      } else {
        html += `${attr.name} `;
      }
    }
    html = html.substring(0, html.length - 1) + '>';

    const nodes = Array.from(ref.childNodes);

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
        txt = txt.replace('<', '&lt').replace('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const computed = await this.computeHtmlIntermediateData(node as Element);
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
          const computed = await this.computeHtmlIntermediateData(node as Element);
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

  private static computeImgValue = async (ref: Element): Promise<string> => {
    let value = '';

    // we have data already inside image so just add it
    if (value.startsWith('data:')) {
      return value;
    }
    // data-src
    if (ref.getAttribute('data-src')) {
      value = ref.getAttribute('data-src') || '';
      const url = this.computeUrl(value);
      const imageData = await this.fetchImage(url);
      if (imageData.ok) {
        return imageData.res;
      }
    }

    // data-pin-media - maybe merge with data-src
    if (ref.getAttribute('data-pin-media')) {
      value = ref.getAttribute('data-pin-media') || '';
      const url = this.computeUrl(value);
      const imageData = await this.fetchImage(url);
      if (imageData.ok) {
        return imageData.res;
      }
    }

    // srcset
    if (ref.getAttribute('srcset')) {
      // TODO check if ok for all cases
      const srcset = (ref.getAttribute('srcset') || '').split(',');
      // last value so it's biggest image
      value = srcset[srcset.length - 1].trim().split(' ')[0];
      const url = this.computeUrl(value);
      if (url.startsWith('http')) {
        const imageData = await this.fetchImage(url);
        if (imageData.ok) {
          return imageData.res;
        }
      }
    }

    value = ref.getAttribute('src') || '';
    value = value.replaceAll('"', '&quot;');

    const url = this.computeUrl(value);
    const imageData = await this.fetchImage(url);
    if (imageData.ok) {
      return imageData.res;
    }
    return url;
  };

  private static computeUrl(value: string): string {
    let baseurl = window.location.href;
    // cleanup baseurl ending with html/htm
    if (baseurl.endsWith('html') || baseurl.endsWith('htm')) {
      const a = window.location.pathname.split('/');
      const subpath = a.slice(0, a.length - 1).join('/');
      baseurl = `${window.location.origin}${subpath}`;
    }
    // cleanup ending /
    if (baseurl.endsWith('/')) baseurl = baseurl.substring(0, baseurl.length - 1);

    if (value.startsWith('//')) {
      return `${window.location.protocol}${value}`;
    } else if (value.startsWith('/')) {
      return `${window.location.origin}${value}`;
    } else if (value.startsWith('./')) {
      // URL constructor is good with subpath resolution so ../../foo ../foo ./foo
      const url = new URL(baseurl + '/' + value);
      return url.href;
    } else if (!value.startsWith('http')) {
      return `${baseurl}/${value}`;
    }
    return value;
  }

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

  private static fetchIframe = (url: string): Promise<ObjIframeContentDto> => {
    return new Promise<ObjIframeContentDto>((resolve, reject) => {
      TinyEventDispatcher.addListener<ObjIframeContentDto>(
        BusMessageType.CONTENT_FETCH_IFRAME_RESULT,
        (event, key, value) => {
          if (value.url === url) {
            TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IFRAME_RESULT, key);
            resolve(value);
          }
        }
      );
      BrowserApi.sendRuntimeMessage<FetchImageRequest>({
        type: BusMessageType.CONTENT_FETCH_IFRAME,
        data: { url }
      })
        .then(() => {
          /* SKIP */
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  private static fetchImage = (url: string): Promise<FetchResponse<string>> => {
    return new Promise<FetchResponse<string>>((resolve, reject) => {
      TinyEventDispatcher.addListener<FetchResponse<string>>(
        BusMessageType.CONTENT_FETCH_IMAGE,
        (event, key, value) => {
          if (value.url === url) {
            TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IMAGE, key);
            resolve(value);
          }
        }
      );
      BrowserApi.sendRuntimeMessage<FetchImageRequest>({
        type: BusMessageType.CONTENT_FETCH_IMAGE,
        data: { url }
      })
        .then(() => {
          /* SKIP */
        })
        .catch((e) => {
          reject(e);
        });
    });
  };
}
