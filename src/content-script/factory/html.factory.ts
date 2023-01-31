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
import { CssFactory } from './css.factory';
import { PinHtmlDataDto } from '../../common/model/obj-pin.model';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { environmentConfig } from '../../common/environment';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class HtmlFactory {
  static async computePinHTMLData(ref: HTMLElement): Promise<PinHtmlDataDto> {
    const parentStyle = document.body.getAttribute('style') || '';
    const htmlContent = this.computeHtmlIntermediateData(ref);
    // fnConsoleLog('HTML :', htmlContent);
    let parent = ref.parentElement;
    // MAYBE WILL HELP - COMPUTE PARENT STYLES UP TO BODY
    // const htmlParentData = HtmlFactory.computeHtmlParentStyles(ref.parentElement);
    // fnConsoleLog('1: ', htmlContent.cssStyles, parent);
    while (parent && parent.tagName.toLowerCase() !== 'html') {
      const attr = parent.getAttributeNode('class');
      if (attr) {
        const a = attr.value.split(' ').filter((e) => !!e);
        htmlContent.cssStyles.push(...a.map((e) => `.${e}`));
      }
      // fnConsoleLog('ADD : ', parent.tagName);
      htmlContent.cssStyles.push(parent.tagName);
      parent = parent.parentElement;
    }
    // fnConsoleLog('2:', htmlContent.cssStyles, parent);
    fnConsoleLog('START COMPUTE CSS !!!');
    const css = await CssFactory.computeCssContent(htmlContent.cssStyles);
    fnConsoleLog('STOP COMPUTE CSS !!!');
    const rect = XpathFactory.computeRect(ref);
    const screenshot = await ScreenshotFactory.takeScreenshot(rect);
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

  static computeHtmlIntermediateData = (ref: Element): HtmlIntermediateData => {
    const tagName = ref.tagName.toLowerCase();
    const cssStyles: string[] = [tagName];
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
    for (const attr of attributes) {
      if (attr.name === 'class') {
        // CLASS CSS SELECTORS
        const a = attr.value.split(' ').filter((e) => !!e);
        cssStyles.push(...a.map((e) => `.${e}`));
        html += `${attr.name}="${attr.value}" `;
      } else if (attr.name === 'href') {
        // HREF
        if (attr.value.startsWith('/')) {
          html += `href="${window.location.origin}${attr.value}" `;
        } else if (!attr.value.startsWith('http')) {
          html += `src="${window.location.origin}/${attr.value}" `;
        } else {
          html += `href="${attr.value}" `;
        }
        html += `target="_blank" `;
      } else if (attr.name === 'target') {
        // Skip - we handle it inside href
      } else if (attr.name === 'src') {
        if (attr.value.startsWith('/')) {
          html += `src="${window.location.origin}${attr.value}" `;
        } else if (!attr.value.startsWith('http')) {
          html += `src="${window.location.origin}/${attr.value}" `;
        } else {
          html += `src="${attr.value}" `;
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
        const computed = this.computeHtmlIntermediateData(node as Element);
        html += computed.html;
        cssStyles.push(...computed.cssStyles);
        videoTime.push(...computed.videoTime);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        fnConsoleLog('fnComputeHtmlContent->skipping->COMMENT_NODE', node);
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }
    html += `</${tagName}>`;

    return {
      cssStyles,
      html,
      videoTime
    };
  };

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
}
