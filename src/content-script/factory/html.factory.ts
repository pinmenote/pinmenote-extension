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
import { ContentVideoTime, HtmlIntermediateData, HtmlParentStyles } from '../../common/model/html.model';
import { FetchImageRequest, FetchImageResponse } from '../../common/model/obj-request.model';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { CssFactory } from './css.factory';
import { ObjUrlDto } from '../../common/model/obj.model';
import { PinHtmlDataDto } from '../../common/model/obj-pin.model';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { environmentConfig } from '../../common/environment';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class HtmlFactory {
  static async computeHtmlData(ref: HTMLElement, url?: ObjUrlDto): Promise<PinHtmlDataDto> {
    let parentStyle = document.body.getAttribute('style') || '';
    const htmlContent = await this.computeHtmlIntermediateData(ref);
    // fnConsoleLog('HTML :', htmlContent);
    let parent = ref.parentElement;
    // TODO css variables ex youtube channel banner
    while (parent && parent.tagName.toLowerCase() !== 'html') {
      const attr = parent.getAttributeNode('style');
      if (attr) {
        parentStyle += `;${attr.value}`;
      }
      // fnConsoleLog('ADD : ', parent.tagName);
      parent = parent.parentElement;
    }
    // MAYBE WILL HELP - COMPUTE PARENT STYLES UP TO BODY
    // const htmlParentData = HtmlFactory.computeHtmlParentStyles(ref.parentElement);
    fnConsoleLog('START COMPUTE CSS !!!');
    const css = await CssFactory.computeCssContent();
    fnConsoleLog('STOP COMPUTE CSS !!!');
    const rect = XpathFactory.computeRect(ref);
    const screenshot = await ScreenshotFactory.takeScreenshot(rect, url);
    return {
      parentStyle,
      html: htmlContent.html,
      text: ref.innerText,
      rect,
      screenshot,
      border: {
        style: ref.style.border,
        radius: ref.style.borderRadius
      },
      css
    };
  }

  static computeHtmlIntermediateData = async (ref: Element): Promise<HtmlIntermediateData> => {
    const tagName = ref.tagName.toLowerCase();
    let html = `<${tagName} `;
    const videoTime: ContentVideoTime[] = [];

    if (tagName === 'video') {
      // fnConsoleLog('VIDEO !!!', (el as HTMLVideoElement).currentTime);
      videoTime.push({
        xpath: XpathFactory.newXPathString(ref as HTMLElement),
        currentTime: (ref as HTMLVideoElement).currentTime,
        displayTime: environmentConfig.settings.videoDisplayTime
      });
    }

    const attributes: Attr[] = Array.from(ref.attributes);
    let srcFilled = false;
    for (const attr of attributes) {
      if (attr.name === 'href') {
        // HREF
        const url = this.computeUrl(attr.value);
        html += `href="${url}" `;
        html += `target="_blank" `;
      } else if (attr.name === 'target') {
        // Skip - we handle it inside href
      } else if (attr.name === 'src') {
        const url = this.computeUrl(attr.value);
        if (tagName === 'img') {
          const imageData = await this.fetchImage(url);
          if (imageData.error) {
            html += `src="${url}" `;
          } else {
            html += `src="${imageData.data}" `;
            srcFilled = true;
          }
        } else {
          html += `src="${url}" `;
          srcFilled = true;
        }
      } else if (attr.name == 'data-src') {
        const url = this.computeUrl(attr.value);
        if (tagName === 'img' && !srcFilled) {
          const imageData = await this.fetchImage(url);
          if (imageData.error) {
            html += `src="${url}" `;
          } else {
            html += `src="${imageData.data}" `;
            srcFilled = true;
          }
        }
      } else if (attr.name === 'srcset') {
        // TODO check if ok for all cases
        const srcset = attr.value.split(',');
        // last value so it's biggest image
        const urlvalue = srcset[srcset.length - 1].trim().split(' ')[0];

        const url = this.computeUrl(urlvalue);
        if (url.startsWith('http') && tagName === 'img' && !srcFilled) {
          const imageData = await this.fetchImage(url);
          if (imageData.error) {
            html += `src="${url}" `;
          } else {
            html += `src="${imageData.data}" `;
            srcFilled = true;
          }
        }
      } else {
        html += `${attr.name}="${attr.value}" `;
      }
    }
    html = html.substring(0, html.length - 1) + '>';

    const nodes = Array.from(ref.childNodes);

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        html += node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const computed = await this.computeHtmlIntermediateData(node as Element);
        html += computed.html;
        videoTime.push(...computed.videoTime);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        fnConsoleLog('fnComputeHtmlContent->skipping->COMMENT_NODE', node);
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }
    html += `</${tagName}>`;

    return {
      html,
      videoTime
    };
  };

  private static computeUrl(value: string): string {
    if (value.startsWith('//')) {
      return `${window.location.protocol}${value}`;
    } else if (value.startsWith('/')) {
      return `${window.location.origin}${value}`;
    } else if (value.startsWith('./')) {
      const a = window.location.pathname.split('/');
      const subpath = a.slice(0, a.length - 1).join('/');
      const subvalue = value.substring(1);
      return `${window.location.origin}${subpath}${subvalue}`;
    } else if (!value.startsWith('http')) {
      return `${window.location.origin}/${value}`;
    }
    return value;
  }

  static computeHtmlParentStyles = (parent: Element | null): HtmlParentStyles => {
    const cssStyles: string[] = [];
    while (parent && parent.tagName.toLowerCase() !== 'body') {
      const clazz = parent.getAttribute('class');
      if (clazz) {
        const a = clazz.split(' ').filter((e) => !!e);
        cssStyles.push(...a.map((e) => `.${e}`));
      }
      parent = parent.parentElement;
    }
    return {
      html: '',
      cssStyles
    };
  };

  private static fetchImage = (url: string): Promise<FetchImageResponse> => {
    return new Promise<FetchImageResponse>((resolve, reject) => {
      TinyEventDispatcher.addListener<FetchImageResponse>(BusMessageType.CONTENT_FETCH_IMAGE, (event, key, value) => {
        if (value.url === url) {
          TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IMAGE, key);
          resolve(value);
        }
      });
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
