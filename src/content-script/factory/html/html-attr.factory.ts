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
import { HtmlComputeParams } from './html.factory';
import { HtmlIntermediateData } from '../../model/html.model';
import { fnComputeUrl } from '../../../common/fn/fn-compute-url';
import { fnConsoleLog } from '../../../common/fn/fn-console';

const TRANSLATE_REG = new RegExp('(transform: translateY\\()([0-9.px]+)(\\);)', 'g');

export class HtmlAttrFactory {
  static readonly EMPTY_RESULT: HtmlIntermediateData = {
    html: '',
    content: []
  };

  static computeAttrValues = async (
    tagName: string,
    attributes: Attr[],
    params: HtmlComputeParams
  ): Promise<string> => {
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
        attrValue = attrValue.replaceAll('&quot;', '"');
        const urlList = attrValue.match(CSS_URL_REG);
        if (urlList) {
          attrValue = await CssFactory.fetchUrls(attrValue, params);
        }
        attrValue = attrValue.replaceAll('"', '&quot;');
        html += `${attr.name}="${attrValue}" `;
      } else if (attrValue) {
        html += `${attr.name}="${attrValue}" `;
      } else {
        html += `${attr.name} `;
      }
    }
    return html;
  };

  static cutPartialStyles(value: string): string {
    value = value.replaceAll(TRANSLATE_REG, '').replaceAll('"', '&quot;');
    return value;
  }
}
