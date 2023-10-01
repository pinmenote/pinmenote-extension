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
import { SegmentCss, SegmentPage } from '@pinmenote/page-compute';
import { PageSegmentGetCommand } from '../command/snapshot/segment/page-segment-get.command';

const POWERED_BY = `<div style="position: fixed;z-index: calc(9e999);line-height: 100%;bottom:4px;right:4px;background-color: #fff;color: #000;font-size: 0.6em;padding: 5px;border: 1px dashed #000;border-radius: 3px;">saved with <a style="color:#000;text-decoration: underline;font-weight: bold;" target="_blank" href="https://pinmenote.com">pinmenote.com</a></div>`;

export class IframeHtmlFactory {
  static computeHtml = async (snapshot: SegmentPage, title = ''): Promise<string> => {
    let style = '';
    for (const hash of snapshot.css) {
      const dto = await new PageSegmentGetCommand<SegmentCss>(hash).execute();
      if (dto) {
        const css: SegmentCss = dto.content;
        style += `<style hash="${hash}"`;
        css.media ? (style += ` media="${css.media}">`) : (style += '>');
        style += css.data + '</style>';
      }
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
    <title>${title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    ${style}
  </head>
  ${snapshot.html.html}
</html>`;
  };

  static computeDownload = (pageSegment: SegmentPage, iframe: HTMLIFrameElement): string => {
    if (!iframe.contentWindow) return '';
    const innerFrames = iframe.contentWindow.document.getElementsByTagName('iframe');
    for (const frame of innerFrames) {
      if (!frame.contentWindow) continue;
      frame.srcdoc = `<html>
<head>${frame.contentWindow.document.head.innerHTML}</head>
<body>${frame.contentWindow.document.body.innerHTML}</body>
</html>`;
    }
    return `<!doctype html>
<html ${pageSegment.html.htmlAttr}>
  <head>
      ${iframe.contentWindow.document.head.innerHTML}
      ${POWERED_BY}
  </head>
  <body>
  
  <script>
  document.readyState !== 'complete' ? document.addEventListener('readystatechange', async () => {
          if (document.readyState === 'complete') renderTemplates();
        }) : renderTemplates();
    const renderTemplates = () => {
        const elList = Array.from(document.querySelectorAll('[data-pmn-shadow]'));
        for (const el of elList) {
          renderTemplate(el);
        }        
    }    
    const renderTemplate = (el) => {
      const templates = Array.from(el.querySelectorAll('template'));
      for (const template of templates) {
        if (template.parentElement) {
          const mode = template.getAttribute('data-mode');
          const shadow = template.parentElement.attachShadow({ mode: mode });
          shadow.appendChild(template.content.cloneNode(true));
          for (const child of Array.from(shadow.children)) {
            renderTemplate(child);
          }
        }
      }
    };  
  </script>
    ${iframe.contentWindow.document.body.innerHTML}    
  </body>
</html>`;
  };
}
