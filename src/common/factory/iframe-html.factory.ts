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
import { SegmentCssDto, SegmentPageDto } from '../model/obj/page-segment.dto';
import { PageSegmentGetCommand } from '../command/snapshot/segment/page-segment-get.command';
import { PageSnapshotDto } from '../model/obj/page-snapshot.dto';
import { fnConsoleLog } from '../fn/fn-console';

export class IframeHtmlFactory {
  static computeHtml = async (snapshot: SegmentPageDto, title?: string): Promise<string> => {
    let style = '';
    let titleTag = '';
    if (title) {
      titleTag = `<title>${title}</title>`;
    }
    for (const hash of snapshot.css) {
      const dto = await new PageSegmentGetCommand<SegmentCssDto>(hash).execute();
      if (dto) {
        const css: SegmentCssDto = dto.content;
        style += '<style';
        css.media ? (style += ` media="${css.media}">`) : (style += '>');
        style += css.data + '</style>';
      }
      fnConsoleLog('css', dto);
      /* just ignore links because can't render them inside extension
      else if (css.href) {
        style += `<link rel="stylesheet" href="${css.href}" />`;
      }*/
    }
    // funny people -> workaround for -> <noscript> html {opacity: 1} </noscript>
    // and <style> html { display: 'none' } </style>
    // ugly truth if you can modify something - someone will modify it
    const r = new RegExp('(style=")(.*?")');
    const m = snapshot.html.htmlAttr.match(r);
    if (m) {
      snapshot.html.htmlAttr = snapshot.html.htmlAttr.replaceAll(
        m[0],
        `${m[0].substring(0, m[0].length - 1)};opacity:1;display:inline-block;"`
      );
    } else {
      snapshot.html.htmlAttr += ' style="opacity: 1;display: inline-block;"';
    }
    return `<!doctype html>
<html ${snapshot.html.htmlAttr}>
  <head>
    ${titleTag}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    ${style}
  </head>
  ${snapshot.html.html}
</html>`;
  };

  static computeDownload = (snapshot: PageSnapshotDto, data: SegmentPageDto): string => {
    return '';
  };
}
