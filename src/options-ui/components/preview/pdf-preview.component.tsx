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
import { BrowserStorage } from '@pinmenote/browser-api';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjPdfDto } from '../../../common/model/obj/obj-pdf.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/fn-console';

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
        await render(parseInt(idhash[1]));
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

    const el = document.createElement('iframe');
    el.width = '100%';
    el.height = '100%';
    el.setAttribute('src', data || '');
    pdfRef.current.appendChild(el);
  };

  const handleDownload = () => {
    alert('download');
    /*const url = window.URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'text/html' }));
        const filename = `${fnUid()}.pdf`;
        await BrowserApi.downloads.download({
            url,
            filename,
            conflictAction: 'uniquify'
        });*/
  };

  const handleClose = () => {
    document.title = 'pin board';
    window.location.hash = '';
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
      <div style={{ backgroundColor: '#ffffff', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
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
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }} ref={pdfRef}></div>
    </div>
  );
};
