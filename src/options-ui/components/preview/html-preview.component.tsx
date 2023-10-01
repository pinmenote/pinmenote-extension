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
import { SegmentImg, SegmentPage, SegmentType } from '@pinmenote/page-compute';
import { BrowserApi } from '@pinmenote/browser-api';
import CircularProgress from '@mui/material/CircularProgress';
import { IframeHtmlFactory } from '../../../common/factory/iframe-html.factory';
import { LinkHrefStore } from '../../../common/store/link-href.store';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { PageSegmentGetCommand } from '../../../common/command/snapshot/segment/page-segment-get.command';
import { PageSnapshotDto } from '../../../common/model/obj/page-snapshot.dto';
import { PinComponent } from '../../../common/components/pin/pin.component';
import { SettingsStore } from '../../store/settings.store';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSleep } from '../../../common/fn/fn-sleep';
import { fnUid } from '../../../common/fn/fn-uid';
import { HtmlPreviewHeaderComponent } from './html-preview-header.component';

interface Props {
  visible: boolean;
}

export const HtmlPreviewComponent: FunctionComponent<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState<boolean>(props.visible);

  const [pageSegment, setPageSegment] = useState<SegmentPage | undefined>();
  const [objData, setObjData] = useState<ObjDto<ObjPageDto> | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreLoading, setIsPreLoading] = useState<boolean>(true);

  useEffect(() => {
    setVisible(props.visible);
    if (props.visible !== visible && props.visible) {
      const idhash = window.location.hash.split('/');
      if (!idhash[0].startsWith('#obj')) return;
      try {
        fnConsoleLog('HtmlPreviewComponent->useEffect->render', props.visible, visible);
        render(parseInt(idhash[1])).catch((e) => fnConsoleLog('HtmlPreviewComponent->useEffect->render->ERROR', e));
      } catch (e) {
        fnConsoleLog('Error render or parseInt', e);
      }
    }
  }, [props]);

  const render = async (id: number) => {
    setIsPreLoading(true);
    setIsLoading(true);
    const obj = await new ObjGetCommand<ObjPageDto>(id).execute();
    setObjData(obj);
    const pageSegment = await new PageSegmentGetCommand<SegmentPage>(obj.data.snapshot.segment).execute();
    if (pageSegment) {
      setPageSegment(pageSegment.content);
    } else {
      fnConsoleLog('NOT FOUND ', obj.data.snapshot, 'hash', obj.data.snapshot.segment);
    }
    if (obj.data.snapshot.data.canvas) {
      renderCanvas(obj);
    } else {
      await renderSnapshot(obj, pageSegment?.content);
    }
    if (obj.type === ObjTypeDto.PageSnapshot) {
      const pinIds = await LinkHrefStore.pinIds(obj.data.snapshot.info.url.href);
      await renderPins(pinIds);
    }
  };

  const renderPins = async (ids: number[]) => {
    if (!htmlRef.current?.lastElementChild) return;

    const el = htmlRef.current?.lastElementChild as HTMLIFrameElement;
    if (!el.contentDocument || !el.contentWindow) return;
    fnConsoleLog('HtmlPreviewComponent->renderPins', ids);

    for (const id of ids) {
      const pin = await new ObjGetCommand<ObjPinDto>(id).execute();
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

  const renderCanvas = (obj: ObjDto<ObjPageDto>, content?: SegmentPage) => {
    const snapshot: PageSnapshotDto = obj.data.snapshot;
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

  const renderSnapshot = async (obj: ObjDto<ObjPageDto>, segment?: SegmentPage): Promise<void> => {
    const snapshot: PageSnapshotDto = obj.data.snapshot;
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

    document.title = `pin - ${snapshot.info.title}`;
    const html = await IframeHtmlFactory.computeHtml(segment, false, snapshot.info.title);

    await writeDoc(iframe.contentWindow.document, html, segment.assets || [], true);

    fnConsoleLog('DONE', obj, 'segment', segment);
    setIsLoading(false);
  };

  const writeDoc = async (doc: Document, html: string, assets: string[], cleanLoader = false): Promise<void> => {
    doc.write(html);
    doc.close();
    if (cleanLoader) setIsPreLoading(false);
    if (doc.readyState !== 'complete') {
      doc.addEventListener('readystatechange', async () => {
        if (doc.readyState === 'complete') await renderAssetList(assets || [], doc);
      });
    } else {
      await renderAssetList(assets || [], doc);
    }
  };

  const renderAssetList = async (assets: string[], doc: Document): Promise<void> => {
    fnConsoleLog('RENDER CONTENT', assets.length);
    for (const hash of assets) {
      const elList = doc.querySelectorAll(`[data-pin-hash="${hash}"]`);
      const elArray = Array.from(elList);
      try {
        for (const el of elArray) {
          await renderAsset(hash, el);
        }
      } catch (e) {
        fnConsoleLog('htmlPreview->renderAssetList->ERROR', e, hash);
      }
    }
    const elList = Array.from(doc.querySelectorAll(`[data-pmn-shadow]`));
    for (const el of elList) {
      renderTemplate(el);
    }
  };

  const renderAsset = async (hash: string, el: Element): Promise<void> => {
    const dto = await new PageSegmentGetCommand(hash).execute();
    if (!dto) {
      fnConsoleLog('renderAsset->missing->hash', hash);
      return;
    }
    await fnSleep(2);
    switch (dto.type) {
      case SegmentType.IFRAME: {
        const iframe: SegmentPage = dto.content as SegmentPage;
        const doc = (el as HTMLIFrameElement).contentWindow?.document;
        if (!doc) return;
        const iframeHtml = await IframeHtmlFactory.computeHtml(iframe, true);
        await writeDoc(doc, iframeHtml, iframe.assets);
        break;
      }
      case SegmentType.IMG: {
        const img = el as HTMLImageElement;
        img.src = (dto.content as SegmentImg).src;
        approximatePictureSize(img);
        break;
      }
      default:
        fnConsoleLog('UNSUPPORTED TYPE', dto.type, dto);
        break;
    }
  };

  const approximatePictureSize = (img: HTMLImageElement) => {
    // if nothing is set get bounding size and if width > window.innerWidth set width to 100%
    if (img.parentElement?.tagName.toLowerCase() !== 'picture') return;
    if (img.hasAttribute('width') || img.hasAttribute('height')) return;
    if (img.style.width || img.style.height) return;
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) img.style.width = '100%';
    if (rect.width > window.innerWidth) img.style.width = '100%';
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
      // needed for download for now
      //template.remove();
    }
  };

  const handleDownload = async () => {
    if (!pageSegment || !objData) return;
    if (!htmlRef.current) return;
    const iframe = htmlRef.current.lastChild as HTMLIFrameElement;
    // TODO gather all iframe hashes and pass here with content
    const html = IframeHtmlFactory.computeDownload(pageSegment, iframe);
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
    document.title = 'pin board';
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
      <HtmlPreviewHeaderComponent
        obj={objData}
        handleDownload={handleDownload}
        handleClose={handleClose}
        isLoading={isLoading}
      />
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
