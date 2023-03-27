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
import { CssDataDto } from '../model/obj/obj-pin.dto';

export class IframeHtmlFactory {
  static computeHtml = (css: CssDataDto, htmlValue: string): string => {
    // https://www.uefa.com workaround -> <noscript> html {opacity: 1}</noscript> -> seriously ????
    const html = `<html style="opacity: 1">
        <head>            
            ${css.href
              .map((h) => {
                if (h.data) {
                  let out = '<style';
                  h.media ? (out += ` media="${h.media}">`) : (out += '>');
                  out += `${h.data}</style>`;
                  return out;
                }
                return `<link rel="stylesheet" href="${h.href}" />`;
              })
              .join('')}
            <style>${css.css}</style>            
        </head>
        ${htmlValue}
    </html>`;
    return html;
  };
}
