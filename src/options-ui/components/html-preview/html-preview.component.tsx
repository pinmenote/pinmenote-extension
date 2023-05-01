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
import {
  ObjContentDto,
  ObjContentTypeDto,
  ObjIframeContentDto,
  ObjShadowContentDto
} from '../../../common/model/obj/obj-content.dto';
import {
  ObjGetSnapshotContentCommand,
  ObjSnapshotData
} from '../../../common/command/obj/content/obj-get-snapshot-content.command';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { IframeHtmlFactory } from '../../../common/factory/iframe-html.factory';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnSleep } from '../../../common/fn/sleep.fn';
import { fnUid } from '../../../common/fn/uid.fn';

const fnByteToMb = (value?: number): number => {
  if (!value) return 0;
  return Math.floor(value / 10000) / 100;
};

export const HtmlPreviewComponent: FunctionComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const urlRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  const [snapshotData, setSnapshotData] = useState<ObjSnapshotData | undefined>();
  const [snapshot, setSnapshot] = useState<ObjSnapshotDto | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreLoading, setIsPreLoading] = useState<boolean>(true);

  useEffect(() => {
    const htmlKey = TinyEventDispatcher.addListener<ObjSnapshotDto>(
      BusMessageType.OPT_SHOW_HTML,
      async (event, key, value) => {
        setIsPreLoading(true);
        setIsLoading(true);
        setSnapshot(value);
        let c: ObjSnapshotData | undefined = undefined;
        if (value.contentId > 0) {
          c = await new ObjGetSnapshotContentCommand(value.contentId).execute();
          setSnapshotData(c);
        }
        if (value.canvas) {
          renderCanvas(value, c);
        } else {
          await renderSnapshot(value, c);
        }
      }
    );

    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_SHOW_HTML, htmlKey);
    };
  });

  const renderCanvas = (s: ObjSnapshotDto, c?: ObjSnapshotData) => {
    renderHeader(s, c?.size);

    if (!htmlRef.current) return;
    if (!containerRef.current) return;
    containerRef.current.style.display = 'flex';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    htmlRef.current.appendChild(iframe);
    if (!iframe.contentWindow) return;
    let html = `<body>`;
    if (c) {
      html += `${c.snapshot.html}`;
    } else {
      html += `<img src="${s.screenshot || ''}" alt="screenshot" />`;
    }

    html += `</body>`;
    const doc = iframe.contentWindow.document;
    doc.write(html);
    doc.close();

    setIsPreLoading(false);
    setIsLoading(false);
  };

  const renderSnapshot = async (s: ObjSnapshotDto, c?: ObjSnapshotData): Promise<void> => {
    fnConsoleLog('SHOW HTML !!!', s, c, c?.snapshot.css.css.length);
    renderHeader(s, c?.size);
    if (!htmlRef.current) return;
    if (!containerRef.current) return;
    if (!c) return;

    containerRef.current.style.display = 'flex';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.overflow = 'hidden';

    htmlRef.current.appendChild(iframe);
    if (!iframe.contentWindow) return;

    const html = IframeHtmlFactory.computeHtml(c.snapshot);

    const doc = iframe.contentWindow.document;
    await asyncRenderIframe(html, doc);
    setIsPreLoading(false);

    if (c.snapshot.content) {
      fnConsoleLog('RENDER CONTENT', c.snapshot.content.length);
      for (const content of c.snapshot.content) {
        const elList = doc.querySelectorAll(`[data-pin-id="${content.id}"]`);
        const el = elList[0];
        try {
          if (el) await asyncEmbedContent(content, el);
        } catch (e) {
          fnConsoleLog('htmlPreview->asyncEmbedContent->ERROR', e, content);
        }
      }
    }
    fnConsoleLog('DONE');
    setIsLoading(false);
  };

  const renderHeader = (s: ObjSnapshotDto, size?: number): void => {
    if (sizeRef.current) {
      sizeRef.current.innerHTML = `${fnByteToMb(size)} MB`;
    }
    if (titleRef.current) {
      titleRef.current.innerHTML = s.title;
    }
    if (urlRef.current) {
      urlRef.current.innerHTML = `<a href="${s.url.href}">${s.url.href}</a>`;
    }
  };

  const asyncRenderIframe = async (html: string, doc: Document): Promise<void> => {
    return new Promise((resolve) => {
      fnSleep(250)
        .then(() => {
          doc.write(html);
          doc.close();
          resolve();
        })
        .catch(() => {
          /* IGNORE */
        });
    });
  };

  const asyncEmbedContent = async (dto: ObjContentDto, el: Element): Promise<void> => {
    return new Promise((resolve, reject) => {
      fnSleep(5)
        .then(() => {
          if (dto.type === ObjContentTypeDto.IFRAME) {
            const iframe: ObjIframeContentDto = dto.content as ObjIframeContentDto;
            const iframeDoc = (el as HTMLIFrameElement).contentWindow?.document;
            if (iframeDoc) {
              const iframeHtml = IframeHtmlFactory.computeHtml(iframe);
              iframeDoc.write(iframeHtml);
              iframeDoc.close();
              for (const content of iframe.content) {
                const elList = iframeDoc.querySelectorAll(`[data-pin-id="${content.id}"]`);
                const iel = elList[0];
                try {
                  if (iel)
                    asyncEmbedContent(content, iel)
                      .then(() => {
                        /* IGNORE */
                      })
                      .catch(() => {
                        /* IGNORE */
                      });
                } catch (e) {
                  fnConsoleLog('htmlPreview->asyncEmbedContent->ERROR', e, content);
                }
              }
            }
            fnConsoleLog('RENDER IFRAME', iframe.ok, iframe.url);
          } else if (dto.type === ObjContentTypeDto.IMG) {
            fnConsoleLog('RENDER IMAGE');
            (el as HTMLImageElement).src = dto.content as string;
          } else if (dto.type === ObjContentTypeDto.SHADOW) {
            const content = dto.content as ObjShadowContentDto;
            renderShadow(el, content);
            // el.innerHTML = content.html;
          }
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const renderShadow = (el: Element, content: ObjShadowContentDto) => {
    el.innerHTML = content.html + el.innerHTML;
    renderTemplate(el);
  };

  const renderTemplate = (el: Element) => {
    const templates = Array.from(el.querySelectorAll('template'));
    for (const template of templates) {
      // TODO - remove mode
      const mode = template.getAttribute('mode') || template.getAttribute('data-mode');
      if (template.parentElement) {
        const shadow = template.parentElement.attachShadow({ mode: mode as ShadowRootMode });
        shadow.appendChild(template.content.cloneNode(true));
        for (const child of Array.from(shadow.children)) {
          renderTemplate(child);
        }
      }
    }
  };

  const handleDownload = async () => {
    if (!snapshotData || !snapshot) return;
    const html = IframeHtmlFactory.computeDownload(snapshot, snapshotData);
    // https://stackoverflow.com/a/54302120 handle utf-8 string download
    const url = window.URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'text/html' }));
    const filename = `${fnUid()}.html`;
    await BrowserApi.downloads.download({
      url,
      filename,
      conflictAction: 'uniquify'
    });
  };

  const handleClose = () => {
    if (!htmlRef.current) return;
    if (!containerRef.current) return;
    if (htmlRef.current.childNodes.length === 1) return;
    if (htmlRef.current.lastChild) htmlRef.current.removeChild(htmlRef.current.lastChild);
    containerRef.current.style.display = 'none';
  };
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        display: 'none',
        position: 'absolute',
        zIndex: 'calc(9e999)',
        top: '0px',
        left: '0px'
      }}
    >
      <div style={{ backgroundColor: '#ffffff', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ marginLeft: '10px', marginBottom: '5px' }}>
          <h2 style={{ marginTop: '5px', marginBottom: '5px' }} ref={titleRef}></h2>
          <div ref={urlRef}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: isLoading ? 'flex' : 'none' }}>
            <CircularProgress />
          </div>
          <div style={{ fontSize: '2em', marginLeft: '10px' }} ref={sizeRef}></div>
          <IconButton onClick={handleDownload}>
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={handleClose}>
            <ClearIcon />
          </IconButton>
        </div>
      </div>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }} ref={htmlRef}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: isPreLoading ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </div>
      </div>
    </div>
  );
};
