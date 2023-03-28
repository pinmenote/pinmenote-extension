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
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { IframeHtmlFactory } from '../../../common/factory/iframe-html.factory';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnUid } from '../../../common/fn/uid.fn';

export const HtmlPreviewComponent: FunctionComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [snapshot, setSnapshot] = useState<ObjSnapshotDto | undefined>();

  useEffect(() => {
    const htmlKey = TinyEventDispatcher.addListener<ObjSnapshotDto>(
      BusMessageType.OPT_SHOW_HTML,
      (event, key, value) => {
        setSnapshot(value);
        renderSnapshot(value);
      }
    );

    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_SHOW_HTML, htmlKey);
    };
  });

  const renderSnapshot = (value: ObjSnapshotDto): void => {
    fnConsoleLog('SHOW HTML !!!');
    if (!htmlRef.current) return;
    if (!containerRef.current) return;

    containerRef.current.style.display = 'flex';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    htmlRef.current.appendChild(iframe);
    if (!iframe.contentWindow) return;
    let html = '';
    if (value.canvas) {
      html = `<body><img src="${value.screenshot || ''}" /></body>`;
    } else {
      html = IframeHtmlFactory.computeHtml(value.css, value.html) || '';
    }

    const doc = iframe.contentWindow.document;
    doc.write(html);
    doc.close();

    // TODO remove condition before release
    if (value.iframe) {
      for (const iframe of value.iframe) {
        fnConsoleLog('IFRAME RENDER : ', iframe.uid);
        const el = doc.getElementById(iframe.uid);
        if (el) {
          const iframeEl = el as HTMLIFrameElement;
          const iframeDoc = iframeEl.contentWindow?.document;
          if (iframeDoc) {
            const iframeHtml = IframeHtmlFactory.computeHtml(iframe.html.css, iframe.html.html);
            iframeDoc.write(iframeHtml);
            iframeDoc.close();
          }
        }
      }
    }

    if (!titleRef.current) return;
    titleRef.current.innerText = value.title;
  };

  const handleDownload = async () => {
    if (!snapshot) return;
    const html = IframeHtmlFactory.computeHtml(snapshot.css, snapshot.html) || '';
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
    if (!htmlRef.current.firstChild) return;
    htmlRef.current.removeChild(htmlRef.current.firstChild);
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
        <h1 style={{ marginLeft: '10px' }} ref={titleRef}></h1>
        <div>
          <IconButton onClick={handleDownload}>
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={handleClose}>
            <ClearIcon />
          </IconButton>
        </div>
      </div>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }} ref={htmlRef}></div>
    </div>
  );
};
