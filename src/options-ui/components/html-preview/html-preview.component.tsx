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
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { BusMessageType } from '../../../common/model/bus.model';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { IframeHtmlFactory } from '../../../common/factory/iframe-html.factory';
import { ObjBookmarkDto } from '../../../common/model/obj/obj-bookmark.dto';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export const HtmlPreviewComponent: FunctionComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const htmlKey = TinyEventDispatcher.addListener<ObjBookmarkDto>(
      BusMessageType.OPT_SHOW_HTML,
      (event, key, value) => {
        fnConsoleLog('SHOW HTML !!!');
        if (!htmlRef.current) return;
        if (!containerRef.current) return;

        containerRef.current.style.display = 'flex';
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '100%';
        htmlRef.current.appendChild(iframe);
        if (!iframe.contentWindow) return;

        const html = IframeHtmlFactory.computeBookmarkHtml(value) || '';

        const doc = iframe.contentWindow.document;
        doc.write(html);
        doc.close();

        if (!titleRef.current) return;
        titleRef.current.innerText = value.title;
      }
    );

    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_SHOW_HTML, htmlKey);
    };
  });

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
        <IconButton onClick={handleClose}>
          <ClearIcon />
        </IconButton>
      </div>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }} ref={htmlRef}></div>
    </div>
  );
};
