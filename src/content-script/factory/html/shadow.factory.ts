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
import { CSS_IMPORT_REG, CssFactory } from '../css.factory';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlConstraints } from './html.constraints';
import { HtmlFactory } from './html.factory';
import { HtmlImgFactory } from './html-img.factory';
import { HtmlIntermediateData } from '../../../common/model/html.model';
import { ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { fnComputeUrl } from '../../../common/fn/compute-url.fn';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnUid } from '../../../common/fn/uid.fn';

export class ShadowFactory {
  static computeShadow = async (
    tagName: string,
    ref: Element,
    shadow: ShadowRoot,
    skipUrlCache: Set<string>
  ): Promise<HtmlIntermediateData> => {
    fnConsoleLog('COMPUTE SHADOW !!!', tagName, ref);
    const uid = fnUid();
    let html = `<${tagName} data-pin-id="${uid}" `;
    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes));
    html = html.substring(0, html.length - 1) + '>';

    html += await this.computeChildren(Array.from(ref.childNodes), skipUrlCache);

    html += `</${tagName}>`;
    const shadowHtml = await this.computeShadowHtml(shadow, skipUrlCache);
    return {
      html,
      video: [],
      content: [
        {
          id: uid,
          type: ObjContentTypeDto.SHADOW,
          content: {
            html: shadowHtml
          }
        }
      ]
    };
  };

  private static computeChildren = async (nodes: ChildNode[], skipUrlCache?: Set<string>): Promise<string> => {
    let html = '';
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
        txt = txt.replace('<', '&lt').replace('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        html += await this.computeShadowChild(node as Element, skipUrlCache);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        html += '<!---->';
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }
    return html;
  };

  private static computeShadowHtml = async (ref: ShadowRoot, skipUrlCache?: Set<string>): Promise<string> => {
    const html = await this.computeChildren(Array.from(ref.childNodes), skipUrlCache);
    return `<template data-mode="${ref.mode}">${html}</template>`;
  };

  private static computeShadowChild = async (ref: Element, skipUrlCache?: Set<string>): Promise<string> => {
    const tagName = ref.tagName.toLowerCase();

    let htmlPrefilled = false;

    let html = `<${tagName} `;

    if (tagName === 'link') {
      const uri = ref.getAttribute('href');
      if (uri) {
        const url = fnComputeUrl(uri);
        const css = await CssFactory.fetchCss(url);
        if (css.ok) {
          return this.computeCssData(css.res);
        } else {
          fnConsoleLog('computeShadowChild->link->error', css);
          return '';
        }
      }
    } else if (tagName === 'style') {
      return this.computeCssData(ref.innerHTML);
    } else if (tagName === 'picture') {
      const pic = await HtmlFactory.computePicture(ref as HTMLPictureElement, true, skipUrlCache);
      return pic.html;
    } else if (!HtmlConstraints.KNOWN_ELEMENTS.includes(tagName)) {
      const shadow = BrowserApi.shadowRoot(ref);

      if (shadow) {
        html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes));
        html = html.substring(0, html.length - 1) + '>';
        html += await this.computeShadowHtml(shadow, skipUrlCache);
        htmlPrefilled = true;
      }
    }

    if (!htmlPrefilled) {
      html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes));
      if (tagName === 'img') {
        const value = await HtmlImgFactory.computeImgValue(ref as HTMLImageElement, skipUrlCache);
        html += `src="${value}" `;
      }
      html = html.substring(0, html.length - 1) + '>';
    }

    html += await this.computeChildren(Array.from(ref.childNodes), skipUrlCache);
    html += `</${tagName}>`;
    return html;
  };

  private static computeCssData = async (cssData: string): Promise<string> => {
    const imports = await CssFactory.fetchImports(cssData);
    cssData = cssData.replaceAll(CSS_IMPORT_REG, '').trim();
    cssData = await CssFactory.fetchUrls(cssData);
    cssData = `<style>${cssData}</style>`;
    for (const imp of imports) {
      if (!imp.data) continue;
      cssData =
        `<style>${imp.data}</style>
` + cssData;
    }
    return cssData;
  };
}
