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
  ObjShadowContentDto,
  ObjSnapshotContentDto
} from '../../../common/model/obj/obj-content.dto';
import { ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import {
  ObjGetSnapshotContentCommand,
  ObjSnapshotData
} from '../../../common/command/obj/content/obj-get-snapshot-content.command';
import { ObjPageDto, ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { IframeHtmlFactory } from '../../../common/factory/iframe-html.factory';
import { LinkHrefStore } from '../../../common/store/link-href.store';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjPinGetCommand } from '../../../common/command/obj/obj-pin-get.command';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { PinComponent } from '../../../common/components/pin/pin.component';
import { SettingsStore } from '../../store/settings.store';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnParse5 } from '../../../common/fn/fn-parse5';
import { fnSleep } from '../../../common/fn/fn-sleep';
import { fnUid } from '../../../common/fn/fn-uid';

const fnByteToMb = (value?: number): number => {
  if (!value) return 0;
  return Math.floor(value / 10000) / 100;
};

interface Props {
  visible: boolean;
}

export const HtmlPreviewComponent: FunctionComponent<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const urlRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState<boolean>(props.visible);

  const [snapshotData, setSnapshotData] = useState<ObjSnapshotData | undefined>();
  const [snapshot, setSnapshot] = useState<ObjSnapshotDto | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreLoading, setIsPreLoading] = useState<boolean>(true);

  useEffect(() => {
    setVisible(props.visible);
    if (props.visible !== visible && props.visible) {
      const idhash = window.location.hash.split('/')[1];
      try {
        fnConsoleLog('HtmlPreviewComponent->useEffect->render', props.visible, visible);
        render(parseInt(idhash));
      } catch (e) {
        fnConsoleLog('Error render or parseInt', e);
      }
    }
  });

  const render = (id: number) => {
    if (titleRef.current) titleRef.current.innerHTML = '';
    if (sizeRef.current) sizeRef.current.innerHTML = '';
    if (urlRef.current) urlRef.current.innerHTML = '';
    setTimeout(async () => {
      setIsPreLoading(true);
      setIsLoading(true);
      const obj = await new ObjGetCommand<ObjPageDto>(id).execute();
      setSnapshot(obj.data.snapshot);
      let c: ObjSnapshotData | undefined = undefined;
      if (obj.data.snapshot.contentId > 0) {
        c = await new ObjGetSnapshotContentCommand(obj.data.snapshot.contentId).execute();
        const a = Date.now();
        const dom = fnParse5(c.snapshot.html);
        fnConsoleLog('DOM !!!', dom, 'in', Date.now() - a);
        fnConsoleLog('obj', obj, 'snapshot', c);
        setSnapshotData(c);
      }
      if (obj.data.snapshot.canvas) {
        renderCanvas(obj.data.snapshot, c);
      } else {
        await renderSnapshot(obj.data.snapshot, c);
      }
      if (obj.type === ObjTypeDto.PageSnapshot) {
        const pinIds = await LinkHrefStore.pinIds(obj.data.snapshot.url.href);
        await renderPins(pinIds);
      }
    });
  };

  const renderPins = async (ids: number[]) => {
    if (!htmlRef.current?.lastElementChild) return;

    const el = htmlRef.current?.lastElementChild as HTMLIFrameElement;
    if (!el.contentDocument || !el.contentWindow) return;

    await SettingsStore.fetchData();
    fnConsoleLog('PIN IDS !!!!', ids, 'iframe', el);

    for (const id of ids) {
      const pin = await new ObjPinGetCommand(id).execute();
      if (pin.data.iframe) {
        renderIframePin(el, pin);
      } else {
        renderHtmlPin(el, pin);
      }
    }
  };

  const renderIframePin = (el: HTMLIFrameElement, pin: ObjDto<ObjPinDto>, depth = 1) => {
    if (!el.contentDocument || !el.contentWindow) return false;
    if (!pin.data.iframe) return;
    let index = pin.data.iframe.index;
    const a = index.split('.');
    if (index.length === depth + 1) {
      renderHtmlPin(el, pin);
    } else {
      // Remove elements and recurrent find iframe for current depth
      a.splice(depth + 1);
      index = a.join('.');
      const iframe = el.contentDocument.querySelector(`[data-pin-iframe-index="${index}"]`);
      if (!iframe) return;
      fnConsoleLog('IFRAME FOUND !!!', index);
      renderIframePin(iframe as HTMLIFrameElement, pin, depth + 1);
    }
  };

  const renderHtmlPin = (el: HTMLIFrameElement, pin: ObjDto<ObjPinDto>) => {
    if (!el.contentDocument || !el.contentWindow) return false;
    if (!SettingsStore.settings) return false;
    const value = XpathFactory.newXPathResult(el.contentDocument, pin.data.xpath);
    const node = value.singleNodeValue as HTMLElement;
    if (!node) return false;
    const pinComponent = new PinComponent(node, pin, {
      settings: SettingsStore.settings,
      document: el.contentDocument,
      window: el.contentWindow
    });
    pinComponent.render();
    fnConsoleLog('PIN !!!', pin.id, pin.data, value);
    return true;
  };

  const renderCanvas = (s: ObjSnapshotDto, c?: ObjSnapshotData) => {
    renderHeader(s, c?.size);

    if (!htmlRef.current) return;
    if (!containerRef.current) return;
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
        const elList = doc.querySelectorAll(`[data-pin-hash="${content.hash}"]`);
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
      urlRef.current.innerHTML = `<a href="${s.url.href}" style="word-break: break-all">${s.url.href}</a>`;
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
            const iframe: ObjSnapshotContentDto = dto.content as ObjSnapshotContentDto;
            const iframeDoc = (el as HTMLIFrameElement).contentWindow?.document;
            if (iframeDoc) {
              const iframeHtml = IframeHtmlFactory.computeHtml(iframe);
              iframeDoc.write(iframeHtml);
              iframeDoc.close();
              for (const content of iframe.content) {
                const elList = iframeDoc.querySelectorAll(`[data-pin-hash="${content.hash}"]`);
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
          } else if (dto.type === ObjContentTypeDto.IMG) {
            const img = el as HTMLImageElement;
            img.src = dto.content as string;
            if (img.parentElement?.tagName.toLowerCase() === 'picture' && !img.hasAttribute('width'))
              img.style.maxWidth = `${window.innerWidth}px`;
          } else if (dto.type === ObjContentTypeDto.SHADOW) {
            const content = dto.content as ObjShadowContentDto;
            renderShadow(el, content);
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
      if (template.parentElement) {
        const mode = template.getAttribute('data-mode');
        const shadow = template.parentElement.attachShadow({ mode: mode as ShadowRootMode });
        shadow.appendChild(template.content.cloneNode(true));
        for (const child of Array.from(shadow.children)) {
          renderTemplate(child);
        }
      }
      template.remove();
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
    window.location.hash = '';
    if (!htmlRef.current) return;
    if (!containerRef.current) return;
    if (htmlRef.current.childNodes.length === 1) return;
    if (htmlRef.current.lastChild) htmlRef.current.removeChild(htmlRef.current.lastChild);
  };
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        display: visible ? 'flex' : 'none',
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
