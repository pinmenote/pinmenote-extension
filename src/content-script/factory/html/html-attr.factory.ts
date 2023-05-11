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
import { CSS_URL_REG, CssFactory } from '../css.factory';
import { HtmlIntermediateData } from '../../../common/model/html.model';
import { fnComputeUrl } from '../../../common/fn/compute-url.fn';
import { fnConsoleLog } from '../../../common/fn/console.fn';

const TRANSLATE_REG = new RegExp('(transform: translateY\\()([0-9.px]+)(\\);)', 'g');

export class HtmlAttrFactory {
  static readonly EMPTY_RESULT: HtmlIntermediateData = {
    html: '',
    video: [],
    content: []
  };

  static computeShadowAttributes = (attributes: Attr[]): string[][] => {
    const out = [];
    for (const attr of attributes) {
      if (!attr.value) continue;
      out.push([attr.name, attr.value]);
    }
    return out;
  };

  static computeAttrValues = async (tagName: string, attributes: Attr[]): Promise<string> => {
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
      } else if (
        (attr.name === 'srcset' || attr.name === 'data-srcset') &&
        (tagName === 'img' || tagName === 'source')
      ) {
        // skip image
      } else if (attr.name === 'src') {
        //  skip image
        if (tagName === 'img' || tagName === 'source') continue;
        const url = fnComputeUrl(attrValue);
        html += `src="${url}" `;
      } else if (attr.name === 'background') {
        const url = fnComputeUrl(attrValue);
        html += `background="${url}" `;
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
        attrValue = attrValue.replaceAll('&quot;', '"');
        if (urlList) {
          const value = await CssFactory.fetchUrls(attrValue);
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

  static cutPartialStyles(value: string): string {
    value = value.replace(TRANSLATE_REG, '');
    return value;
  }
}
