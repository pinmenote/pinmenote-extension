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
import { ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  SegmentImgDto,
  SegmentPageDto,
  SegmentShadowDto,
  SegmentTypeDto
} from '../../../common/model/obj/page-segment.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { IframeHtmlFactory } from '../../../common/factory/iframe-html.factory';
import { LinkHrefStore } from '../../../common/store/link-href.store';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjPinGetCommand } from '../../../common/command/obj/obj-pin-get.command';
import { PageSegmentGetCommand } from '../../../common/command/snapshot/segment/page-segment-get.command';
import { PageSnapshotDto } from '../../../common/model/obj/page-snapshot.dto';
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

  const [pageSegment, setPageSegment] = useState<SegmentPageDto | undefined>();
  const [pageSnapshot, setPageSnapshot] = useState<PageSnapshotDto | undefined>();
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
      setPageSnapshot(obj.data.snapshot);
      const pageSegment = await new PageSegmentGetCommand<SegmentPageDto>(obj.data.snapshot.segmentHash).execute();
      if (pageSegment) {
        const a = Date.now();
        const dom = fnParse5(pageSegment.content.html.html);
        fnConsoleLog('DOM !!!', dom, 'in', Date.now() - a);
        fnConsoleLog('obj', obj, 'snapshot', pageSegment);
        setPageSegment(pageSegment.content);
      } else {
        fnConsoleLog('NOT FOUND ', obj.data.snapshot, 'hash', obj.data.snapshot.segmentHash);
      }
      if (obj.data.snapshot.data.canvas) {
        renderCanvas(obj.data.snapshot);
      } else {
        await renderSnapshot(obj.data.snapshot, pageSegment?.content);
      }
      if (obj.type === ObjTypeDto.PageSnapshot) {
        const pinIds = await LinkHrefStore.pinIds(obj.data.snapshot.info.url.href);
        await renderPins(pinIds);
      }
    });
  };

  const renderPins = async (ids: number[]) => {
    if (!htmlRef.current?.lastElementChild) return;

    const el = htmlRef.current?.lastElementChild as HTMLIFrameElement;
    if (!el.contentDocument || !el.contentWindow) return;

    await SettingsStore.fetchData();
    fnConsoleLog('HtmlPreviewComponent->renderPins', ids);

    for (const id of ids) {
      const pin = await new ObjPinGetCommand(id).execute();
      fnConsoleLog('HtmlPreviewComponent->renderPins->pin', pin);
      if (pin.data.data.iframe) {
        renderIframePin(el, pin);
      } else {
        renderHtmlPin(el, pin);
      }
    }
  };

  const renderIframePin = (el: HTMLIFrameElement, pin: ObjDto<ObjPinDto>) => {
    if (!el.contentDocument || !el.contentWindow) return false;
    if (!pin.data.data.iframe) return;
    const index = pin.data.data.iframe.index;
    const iframe = el.contentDocument.querySelector(`[data-pin-iframe-index="${index}"]`);
    if (!iframe) {
      const iframeList = Array.from(el.contentDocument.getElementsByTagName('iframe'));
      for (const frame of iframeList) {
        renderIframePin(frame, pin);
      }
    } else {
      // fnConsoleLog('renderIframePin->pin', pin, 'index', index);
      renderHtmlPin(iframe as HTMLIFrameElement, pin);
    }
  };

  const renderHtmlPin = (el: HTMLIFrameElement, pin: ObjDto<ObjPinDto>) => {
    if (!el.contentDocument || !el.contentWindow) return false;
    if (!SettingsStore.settings) return false;

    let xpath = pin.data.data.xpath;
    // canvas pins are saved as img
    if (pin.data.data.canvas) {
      xpath = xpath.replaceAll('CANVAS', 'IMG').replaceAll('VIDEO', 'IMG');
    }
    const value = XpathFactory.newXPathResult(el.contentDocument, xpath);
    const node = value.singleNodeValue as HTMLElement;

    if (!node) {
      fnConsoleLog('renderHtmlPin->not-found', pin, 'xpath', pin.data.data.xpath, 'el', el);
      return false;
    }

    const pinComponent = new PinComponent(node, pin, {
      settings: SettingsStore.settings,
      document: el.contentDocument,
      window: el.contentWindow
    });
    pinComponent.render();
    fnConsoleLog('PIN !!!', pin.id, pin.data, value);
    return true;
  };

  const renderCanvas = (snapshot: PageSnapshotDto, content?: SegmentPageDto) => {
    renderHeader(snapshot, 0);

    if (!htmlRef.current) return;
    if (!containerRef.current) return;
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    htmlRef.current.appendChild(iframe);
    if (!iframe.contentWindow) return;
    let html = `<body>`;
    if (content) {
      html += `${content.html.html}`;
    } else {
      html += `<img src="${snapshot.data.screenshot || ''}" alt="screenshot" />`;
    }

    html += `</body>`;
    const doc = iframe.contentWindow.document;
    doc.write(html);
    doc.close();

    setIsPreLoading(false);
    setIsLoading(false);
  };

  const renderSnapshot = async (snapshot: PageSnapshotDto, segment?: SegmentPageDto): Promise<void> => {
    let size = 0;
    renderHeader(snapshot, size);
    if (!htmlRef.current) return;
    if (!containerRef.current) return;
    if (!segment) return;

    containerRef.current.style.display = 'flex';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.overflow = 'hidden';

    htmlRef.current.appendChild(iframe);
    if (!iframe.contentWindow) return;

    const html = await IframeHtmlFactory.computeHtml(segment, snapshot.info.title);

    const doc = iframe.contentWindow.document;
    await renderIframe(html, doc);
    setIsPreLoading(false);

    if (segment.assets) {
      fnConsoleLog('RENDER CONTENT', segment.assets.length);
      for (const hash of segment.assets) {
        const elList = doc.querySelectorAll(`[data-pin-hash="${hash}"]`);
        const elArray = Array.from(elList);
        try {
          for (const el of elArray) {
            size += await renderAsset(hash, el);
          }
        } catch (e) {
          fnConsoleLog('htmlPreview->asyncEmbedContent->ERROR', e, hash);
        }
      }
    }
    fnConsoleLog('DONE');
    setIsLoading(false);
  };

  const renderHeader = (snapshot: PageSnapshotDto, size?: number): void => {
    if (sizeRef.current) {
      sizeRef.current.innerHTML = `${fnByteToMb(size)} MB`;
    }
    if (titleRef.current) {
      titleRef.current.innerHTML = snapshot.info.title;
    }
    if (urlRef.current) {
      urlRef.current.innerHTML = `<a href="${snapshot.info.url.href}" style="word-break: break-all">${snapshot.info.url.href}</a>`;
    }
  };

  const renderIframe = async (html: string, doc: Document): Promise<void> => {
    await fnSleep(10);
    doc.write(html);
    doc.close();
  };

  const renderAsset = async (hash: string, el: Element): Promise<number> => {
    const dto = await new PageSegmentGetCommand(hash).execute();
    if (!dto) {
      fnConsoleLog('asyncEmbedContent->missing->hash', hash);
      return 0;
    }
    await fnSleep(2);
    if (dto.type === SegmentTypeDto.IFRAME) {
      const iframe: SegmentPageDto = dto.content as SegmentPageDto;
      const iframeDoc = (el as HTMLIFrameElement).contentWindow?.document;
      if (iframeDoc) {
        const iframeHtml = await IframeHtmlFactory.computeHtml(iframe);
        iframeDoc.write(iframeHtml);
        iframeDoc.close();
        for (const iframeHash of iframe.assets) {
          const elList = iframeDoc.querySelectorAll(`[data-pin-hash="${iframeHash}"]`);
          const iel = elList[0];
          try {
            if (iel) await renderAsset(iframeHash, iel);
          } catch (e) {
            fnConsoleLog('htmlPreview->asyncEmbedContent->ERROR', e, iframeHash);
          }
        }
      }
    } else if (dto.type === SegmentTypeDto.IMG) {
      const img = el as HTMLImageElement;
      img.src = (dto.content as SegmentImgDto).src;
      if (img.parentElement?.tagName.toLowerCase() === 'picture' && !img.hasAttribute('width'))
        img.style.maxWidth = `${window.innerWidth}px`;
    } else if (dto.type === SegmentTypeDto.SHADOW) {
      const content = dto.content as SegmentShadowDto;
      renderShadow(el, content);
    }
    return 0;
  };

  const renderShadow = (el: Element, content: SegmentShadowDto) => {
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
    if (!pageSegment || !pageSnapshot) return;
    const html = IframeHtmlFactory.computeDownload(pageSnapshot, pageSegment);
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
