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
import { CssStyleListDto } from '../model/obj/obj-pin.dto';

export class IframeHtmlFactory {
  static computeHtml = (cssList: CssStyleListDto, htmlValue: string, htmlAttr?: string): string => {
    let style = '';
    for (const css of cssList.css) {
      if (css.data) {
        style += '<style';
        css.media ? (style += ` media="${css.media}">`) : (style += '>');
        style += css.data + '</style>';
      } else if (css.href) {
        style += `<link rel="stylesheet" href="${css.href}" />`;
      }
    }
    // https://www.uefa.com workaround -> <noscript> html {opacity: 1}</noscript> -> seriously ????
    const html = `<!doctype html>
<html style="opacity: 1" ${htmlAttr ? htmlAttr : ''}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    ${style}        
  </head>
  ${htmlValue}
</html>`;
    return html;
  };
}
