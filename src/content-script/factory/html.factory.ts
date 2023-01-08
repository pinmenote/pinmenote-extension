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
import { ContentVideoTime, HtmlContent, HtmlIntermediateData, HtmlParentStyles } from '../../common/model/html.model';
import { CssFactory } from './css.factory';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { environmentConfig } from '../../common/environment';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class HtmlFactory {
  static computeHtmlContent(ref: HTMLElement): HtmlContent {
    const bodyStyle = document.body.getAttribute('style') || undefined;
    const title = document.title;
    const htmlContent = this.computeHtmlIntermediateData(ref);
    const htmlParentData = HtmlFactory.computeHtmlParentStyles(ref);
    // fnConsoleLog('HTML :', htmlContent);
    let parent = ref.parentElement;
    // MAYBE WILL HELP - COMPUTE PARENT STYLES UP TO BODY
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
    const css = CssFactory.computeCssContent(htmlContent.cssStyles);
    fnConsoleLog('STOP COMPUTE CSS !!!');
    const elementText = ref.innerText;
    const isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;
    return {
      theme: isLightTheme ? 'light' : 'dark',
      bodyStyle,
      title,
      html: htmlContent.html,
      videoTime: htmlContent.videoTime,
      css,
      elementText
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

  static computeHtmlParentStyles = (ref: Element): HtmlParentStyles => {
    let parent = ref.parentElement;
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
