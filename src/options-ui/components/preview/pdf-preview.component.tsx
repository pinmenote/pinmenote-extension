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
import { BrowserApi, BrowserStorage } from '@pinmenote/browser-api';
import { GlobalWorkerOptions, PDFPageProxy, PageViewport, getDocument } from 'pdfjs-dist';
// eslint-disable-next-line sort-imports
import { EventBus, PDFPageView } from 'pdfjs-dist/web/pdf_viewer';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnUid } from '../../../common/fn/fn-uid';
import pdfWorkerUrl from 'url:../../../../node_modules/pdfjs-dist/build/pdf.worker.js';

interface Props {
  visible: boolean;
}

export const PdfPreviewComponent: FunctionComponent<Props> = (props) => {
  const [visible, setVisible] = useState<boolean>(props.visible);
  const pdfRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setVisible(props.visible);
    if (props.visible !== visible && props.visible) {
      const idhash = window.location.hash.split('/');
      try {
        if (!idhash[0].startsWith('#pdf')) return;
        fnConsoleLog('PdfPreviewComponent->useEffect->render', props.visible, visible);
        render(parseInt(idhash[1]))
          .then(() => {
            /* IGNORE */
          })
          .catch(() => {
            /* IGNORE */
          });
      } catch (e) {
        fnConsoleLog('Error render or parseInt', e);
      }
    }
  });

  const render = async (id: number) => {
    if (!pdfRef.current || !titleRef.current) return;
    const obj = await new ObjGetCommand<ObjPdfDto>(id).execute();
    const data = await BrowserStorage.get<string | undefined>(`${ObjectStoreKeys.PDF_DATA}:${obj.data.hash}`);
    const a = obj.data.url.pathname.split('/');

    titleRef.current.innerText = `${a[a.length - 1]}`;

    try {
      GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      // remove data:application/pdf;base64,
      const loadingTask = getDocument({ data: atob(data?.substring(28)) });
      const pdf = await loadingTask.promise;

      let currentPage = 1;

      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1 });

      // https://stackoverflow.com/questions/35987398/pdf-js-how-to-make-pdf-js-viewer-canvas-responsive
      const scale = pdfRef.current.clientWidth / ((viewport.width * 96) / 72);

      const eventBus = new EventBus();
      await renderPage(page, viewport, 1, eventBus, scale);

      // Deferred render
      if (pdf.numPages > 1) {
        const pageRenderInterval = setInterval(async () => {
          currentPage++;
          const p = await pdf.getPage(currentPage);
          await renderPage(p, viewport, currentPage, eventBus, scale);
          if (currentPage >= pdf.numPages) {
            clearInterval(pageRenderInterval);
          }
        }, 250);
      }
    } catch (e) {
      fnConsoleLog('render->ERROR', e);
      // eslint-disable-next-line
      pdfRef.current.innerHTML = `<h1>ERROR RENDERING PDF</h1><br /><p>${e.toString()}</p>`;
    }
  };

  const renderPage = async (
    page: PDFPageProxy,
    viewport: PageViewport,
    index: number,
    eventBus: EventBus,
    scale: number
  ) => {
    if (!pdfRef.current) return;
    const pageView = new PDFPageView({
      container: pdfRef.current,
      id: index,
      scale,
      defaultViewport: viewport,
      eventBus
    });
    pageView.setPdfPage(page);
    await pageView.draw();
  };

  const handleDownload = async () => {
    try {
      const idhash = window.location.hash.split('/');
      const obj = await new ObjGetCommand<ObjPdfDto>(parseInt(idhash[1])).execute();
      const data = await BrowserStorage.get<string | undefined>(`${ObjectStoreKeys.PDF_DATA}:${obj.data.hash}`);
      const pdf = atob(data?.substring(28));
      const buffer = new ArrayBuffer(pdf.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < pdf.length; i++) {
        view[i] = pdf.charCodeAt(i);
      }
      const url = window.URL.createObjectURL(new Blob([view], { type: 'application/pdf' }));
      const filename = `${fnUid()}.pdf`;
      await BrowserApi.downloads.download({
        url,
        filename,
        conflictAction: 'uniquify'
      });
    } catch (e) {
      fnConsoleLog('handleDownload->ERROR', e);
    }
  };

  const handleClose = () => {
    document.title = 'pin board';
    window.location.hash = '';
    if (pdfRef.current) pdfRef.current.innerHTML = '';
  };

  return (
    <div
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
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #000'
        }}
      >
        <div style={{ marginLeft: '10px', marginBottom: '5px' }}>
          <h2 style={{ marginTop: '5px', marginBottom: '5px' }} ref={titleRef}></h2>
          <div ref={urlRef}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleDownload}>
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={handleClose}>
            <ClearIcon />
          </IconButton>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        ref={pdfRef}
      ></div>
    </div>
  );
};
