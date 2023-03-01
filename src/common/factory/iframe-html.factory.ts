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
import { ObjBookmarkDto } from '../model/obj/obj-bookmark.dto';
import { PinHtmlDataDto } from '../model/obj/obj-pin.dto';

export class IframeHtmlFactory {
  static computePinHtml = (content: PinHtmlDataDto, container?: HTMLElement): string => {
    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    const { css, href } = content.css;

    const html = `<html>
        <head>
            ${href
              .map((h) => (h.data ? `<style>${h.data}</style>` : `<link rel="stylesheet" href="${h.href}" />`))
              .join('')}
            <style>${css}</style>            
        </head>
        ${content.html}
    </html>`;
    if (!container) return html;

    container.appendChild(iframe);

    if (!iframe.contentWindow) return '';

    const doc = iframe.contentWindow.document;
    doc.write(html);
    doc.close();

    iframe.width = `${window.innerWidth - 350}px`;
    iframe.height = `${window.innerHeight - 350}px`;

    return html;
  };

  static computeBookmarkHtml = (value: ObjBookmarkDto): string => {
    const html = `<html>
        <head>            
            ${value.css.href
              .map((h) =>
                h.data ? `<style media="${h.media}">${h.data}</style>` : `<link rel="stylesheet" href="${h.href}" />`
              )
              .join('')}
            <style>${value.css.css}</style>            
        </head>
        ${value.html}
    </html>`;
    return html;
  };
}
