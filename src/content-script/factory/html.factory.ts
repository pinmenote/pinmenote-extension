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
import { ObjUrlDto } from '../../common/model/obj/obj.dto';
import { PinHtmlDataDto } from '../../common/model/obj/obj-pin.dto';
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
    // fnConsoleLog(tagName, ref);

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
    let hrefFilled = false;
    for (const attr of attributes) {
      let attrValue = attr.value;
      attrValue = attrValue.replaceAll('"', '&quot;');
      if (!attrValue) continue;

      if (attr.name === 'href' && !hrefFilled) {
        // HREF
        const url = this.computeUrl(attrValue);
        html += `href="${url}" `;
        html += `target="_blank" `;
        hrefFilled = true;
      } else if (attr.name === 'target') {
        // Skip - we handle it inside href
      } else if (attr.name === 'src') {
        const url = this.computeUrl(attrValue);
        if (tagName === 'img') {
          // we have data already inside image so just add it
          if (attrValue.startsWith('data:')) {
            html += `src="${attrValue}" `;
            srcFilled = true;
          } else {
            const imageData = await this.fetchImage(url);
            if (imageData.error) {
              html += `src="${url}" `;
            } else {
              html += `src="${imageData.data}" `;
              srcFilled = true;
            }
          }
        } else {
          html += `src="${url}" `;
          srcFilled = true;
        }
      } else if (attr.name == 'data-src') {
        const url = this.computeUrl(attrValue);
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
        const srcset = attrValue.split(',');
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
      } else if (attr.name === 'data-iframe') {
        if (tagName === 'a' && !hrefFilled) {
          try {
            const dataJSON = window.atob(attrValue);
            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
      } else {
        html += `${attr.name}="${attrValue}" `;
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
      } else if (node.nodeType === Node.COMMENT_NODE) {
        // fnConsoleLog('fnComputeHtmlContent->skipping->COMMENT_NODE', node);
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
