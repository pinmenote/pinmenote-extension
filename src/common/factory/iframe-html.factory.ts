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
import { ObjSnapshotContentDto, ObjSnapshotDto } from '../model/obj/obj-snapshot.dto';
import { ObjIFrameContentDto } from '../model/obj/obj-content.dto';
import { ObjSnapshotData } from '../command/obj/content/obj-get-snapshot-content.command';

export class IframeHtmlFactory {
  static computeHtml = (snapshot: ObjSnapshotContentDto | ObjIFrameContentDto, title?: string): string => {
    let style = '';
    let titleTag = '';
    if (title) {
      titleTag = `<title>${title}</title>`;
    }
    for (const css of snapshot.css.css) {
      if (css.data) {
        style += '<style';
        css.media ? (style += ` media="${css.media}">`) : (style += '>');
        style += css.data + '</style>';
      }
      /* just ignore links because can't render them inside extension
      else if (css.href) {
        style += `<link rel="stylesheet" href="${css.href}" />`;
      }*/
    }
    // funny people -> workaround for -> <noscript> html {opacity: 1} </noscript>
    // and <style> html { display: 'none' } </style>
    return `<!doctype html>
<html style="opacity: 1;display: inline-block;max-width: ${window.innerWidth}" ${snapshot.htmlAttr}>
  <head>
    ${titleTag}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    ${style}        
  </head>
  ${snapshot.html}
</html>`;
  };

  static computeDownload = (snapshot: ObjSnapshotDto, data: ObjSnapshotData): string => {
    let style = '';
    for (const css of data.snapshot.css.css) {
      if (css.data) {
        style += '<style';
        css.media ? (style += ` media="${css.media}">`) : (style += '>');
        style += css.data + '</style>';
      } else if (css.href) {
        style += `<link rel="stylesheet" href="${css.href}" />`;
      }
    }
    return `<!doctype html>
<html style="opacity: 1;display: inline-block;" ${data.snapshot.htmlAttr}>
  <head>
    <title>${snapshot.title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    ${style}
    <script>
        /* hi from pinmenote script - see - https://github.com/pinmenote/pinmenote-extension */
        const content = ${JSON.stringify(data.snapshot.content)}
        
        const renderContent = () => {
            content.forEach((c) => {
              const elList = document.querySelectorAll(\`[data-pin-id="\${c.id}"]\`);
                  const el = elList[0];
                  try {
                    if (el) embedContent(c, el);
                  } catch (e) {
                    console.log('embedContent->ERROR', e, content);
                  }            
            })
        }
        
        const embedContent = (dto, el) => {
            if (dto.type === 1) {
            if (el.contentWindow && el.contentWindow.document) {
              const iframe = dto.content;
              const iframeDoc = el.contentWindow.document;
              const iframeHtml = computeHtml(iframe);
              iframeDoc.write(iframeHtml);
              iframeDoc.close();
              for (const content of iframe.content) {
                const elList = iframeDoc.querySelectorAll(\`[data-pin-id="\${content.id}"]\`);
                const iel = elList[0];
                try {
                  if (iel) embedContent(content, iel)
                } catch (e) {
                  console.log('embedContent->ERROR', e, content);
                }
              }
            }
          } else if (dto.type === 2) {
            el.src = dto.content;
            if (el.parentElement && el.parentElement.tagName === 'picture') {
                el.style.maxWidth = window.innerWidth + 'px';
            }            
          } else if (dto.type === 3) {
            renderShadow(el, dto.content);
          }
        }
        
        const renderShadow = (el, content) => {
          el.innerHTML = content.html + el.innerHTML;
          renderTemplate(el);
        };
        
        const renderTemplate = (el) => {
          const templates = Array.from(el.querySelectorAll('template'));
          for (const template of templates) {
            // TODO - remove mode
            const mode = template.getAttribute('mode') || template.getAttribute('data-mode');
            if (template.parentElement) {
              const shadow = template.parentElement.attachShadow({ mode: mode });
              shadow.appendChild(template.content.cloneNode(true));
              for (const child of Array.from(shadow.children)) {
                renderTemplate(child);
              }
            }
          }
        }
        
        const computeHtml = (snapshot) => {
            let style = '';
            for (const css of snapshot.css.css) {
              if (css.data) {
                style += '<style';
                css.media ? (style += \` media="\${css.media}">\`) : (style += '>');
                style += css.data + '</style>';
              } else if (css.href) {
                style += \`<link rel="stylesheet" href="\${css.href}" />\`;
              }
            }
            return \`<!doctype html>
        <html style="opacity: 1;display: inline-block;" \${snapshot.htmlAttr}>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
            \${style}        
          </head>
          \${snapshot.html}
        </html>\`
        }
        
        console.log('generated using https://github.com/pinmenote/pinmenote-extension');
        if (document.readyState === "complete" || document.readyState === "loaded") {
            renderContent();
        } else {
          window.addEventListener('DOMContentLoaded', (e) => {
              renderContent();
          })
        }
    </script>        
  </head>
  ${data.snapshot.html}
</html>`;
  };
}
