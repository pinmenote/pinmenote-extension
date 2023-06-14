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
import { HtmlComputeParams, HtmlIntermediateData } from '../../model/html.model';
import { BrowserApi } from '@pinmenote/browser-api';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlConstraints } from './html.constraints';
import { HtmlImgFactory } from './html-img.factory';
import { HtmlPictureFactory } from './html-picture.factory';
import { SegmentTypeDto } from '../../../common/model/obj/page-segment.dto';
import { fnComputeUrl } from '../../../common/fn/fn-compute-url';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class ShadowFactory {
  static computeShadow = async (
    tagName: string,
    shadow: ShadowRoot,
    params: HtmlComputeParams
  ): Promise<HtmlIntermediateData> => {
    const shadowHtml = await this.computeShadowHtml(shadow, params);
    const hash = fnSha256(shadowHtml);

    let html = `<${tagName} data-pin-hash="${hash}" `;
    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(params.ref.attributes), params);
    html = html.substring(0, html.length - 1) + '>';

    // @vane shadow element can also have normal children - those are probably rendered from slots
    // - don't fully understand no time and money left for that - it renders correctly and that's enough
    html += await this.computeChildren(Array.from(params.ref.childNodes), params);

    html += `</${tagName}>`;

    params.contentCallback({
      hash,
      type: SegmentTypeDto.SHADOW,
      content: {
        html: shadowHtml
      }
    });

    return {
      html,
      assets: [hash]
    };
  };

  private static computeShadowHtml = async (ref: ShadowRoot, params: HtmlComputeParams): Promise<string> => {
    const html = await this.computeChildren(Array.from(ref.childNodes), params);
    const css = CssFactory.computeAdoptedStyleSheets(ref.adoptedStyleSheets);
    return `<template data-mode="${ref.mode}"><style>${css}</style>${html}</template>`;
  };

  private static computeChildren = async (nodes: ChildNode[], params: HtmlComputeParams): Promise<string> => {
    let html = '';
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nre = new RegExp(String.fromCharCode(160), 'g');
        let txt = node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
        txt = txt.replace('<', '&lt').replace('>', '&gt;');
        html += txt;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        html += await this.computeShadowChild(node as Element, params);
      } else if (node.nodeType === Node.COMMENT_NODE) {
        html += '<!---->';
      } else {
        fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
      }
    }
    return html;
  };

  private static computeShadowChild = async (ref: Element, params: HtmlComputeParams): Promise<string> => {
    const tagName = ref.tagName.toLowerCase();
    // REMEMBER to not skip slot !!!
    if (['script', 'noscript', 'template'].includes(tagName)) return '';

    let htmlPrefilled = false;

    let html = `<${tagName} `;

    if (tagName === 'link') {
      const uri = ref.getAttribute('href');
      if (uri) {
        const url = fnComputeUrl(uri);
        const css = await CssFactory.fetchCss(url);
        if (css.ok) {
          return this.computeCssData(css.data, params);
        } else {
          fnConsoleLog('computeShadowChild->link->error', css);
          return '';
        }
      }
    } else if (tagName === 'style') {
      return this.computeCssData(ref.innerHTML, params);
    } else if (tagName === 'picture') {
      const pic = await HtmlPictureFactory.computePicture(ref as HTMLPictureElement, true, params);
      return pic.html;
    } else if (!HtmlConstraints.KNOWN_ELEMENTS.includes(tagName)) {
      const shadow = BrowserApi.shadowRoot(ref);

      if (shadow) {
        html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes), params);
        html = html.substring(0, html.length - 1) + '>';
        html += await this.computeShadowHtml(shadow, params);
        htmlPrefilled = true;
      }
    }

    if (!htmlPrefilled) {
      html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes), params);
      if (tagName === 'img') {
        const value = await HtmlImgFactory.computeImgValue(ref as HTMLImageElement, params);
        html += `src="${value}" `;
      }
      html = html.substring(0, html.length - 1) + '>';
    }

    html += await this.computeChildren(Array.from(ref.childNodes), params);
    html += `</${tagName}>`;
    return html;
  };

  private static computeCssData = async (cssData: string, params: HtmlComputeParams): Promise<string> => {
    const imports = await CssFactory.fetchImports(cssData, params, undefined, true);
    cssData = cssData.replaceAll(CSS_IMPORT_REG, '').trim();
    cssData = await CssFactory.fetchUrls(cssData, params);
    cssData = `<style>${cssData}</style>`;
    for (const imp of imports) {
      if (!imp) continue;
      cssData =
        `<style>${imp}</style>
` + cssData;
    }
    return cssData;
  };
}
