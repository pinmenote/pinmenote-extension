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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { CssFactory } from '../css.factory';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlConstraints } from './html.constraints';
import { HtmlIntermediateData } from '../../../common/model/html.model';
import { ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { fnComputeUrl } from '../../../common/fn/compute-url.fn';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnUid } from '../../../common/fn/uid.fn';

export class ShadowFactory {
  static computeShadow = async (tagName: string, ref: Element, shadow: ShadowRoot): Promise<HtmlIntermediateData> => {
    const uid = fnUid();
    let html = `<${tagName} data-pin-id="${uid}" `;
    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes));
    html = html.substring(0, html.length - 1) + '>';
    html += `</${tagName}>`;
    fnConsoleLog('SHADOW !!!', html);
    const shadowHtml = await this.computeShadowHtml(shadow);
    return {
      html,
      videoTime: [],
      content: [
        {
          id: uid,
          type: ObjContentTypeDto.SHADOW,
          content: {
            mode: shadow.mode,
            html: shadowHtml
          }
        }
      ]
    };
  };

  private static computeShadowHtml = async (ref: ShadowRoot): Promise<string> => {
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
    if (!HtmlConstraints.KNOWN_ELEMENTS.includes(tagName)) {
      const shadow = BrowserApi.shadowRoot(ref);
      if (shadow) {
        let html = `<${tagName} `;
        html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes));
        html = html.substring(0, html.length - 1) + '>';
        html += await this.computeShadowHtml(shadow);
        html += `</${tagName}>`;
        return html;
      }
    }
    let html = `<${tagName} `;
    html += await HtmlAttrFactory.computeAttrValues(tagName, Array.from(ref.attributes));
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
}