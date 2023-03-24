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
import { BoardStore } from '../../../store/board.store';
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { IframeHtmlFactory } from '../../../../common/factory/iframe-html.factory';
import Link from '@mui/material/Link';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjSnapshotDto } from '../../../../common/model/obj/obj-snapshot.dto';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { fnUid } from '../../../../common/fn/uid.fn';

interface PageElementSnapshotElementParams {
  dto: ObjDto<ObjSnapshotDto>;
}

export const PageElementSnapshotElement: FunctionComponent<PageElementSnapshotElementParams> = (params) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && params.dto.data.screenshot && divRef.current.children.length === 0) {
      const img = new Image();
      img.width = window.innerWidth / 3;
      img.src = params.dto.data.screenshot;
      divRef.current.appendChild(img);
    }
  });

  const handleDownload = async () => {
    const html = IframeHtmlFactory.computeHtml(params.dto.data.css, params.dto.data.html) || '';
    // https://stackoverflow.com/a/54302120 handle utf-8 string download
    const url = window.URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'text/html' }));
    const filename = `${fnUid()}.html`;
    await BrowserApi.downloads.download({
      url,
      filename,
      conflictAction: 'uniquify'
    });
  };

  const handleHtml = () => {
    TinyEventDispatcher.dispatch<ObjSnapshotDto>(BusMessageType.OPT_SHOW_HTML, params.dto.data);
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(params.dto)) {
      TinyEventDispatcher.dispatch<undefined>(BusMessageType.OPT_REFRESH_BOARD, undefined);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: window.innerWidth / 3, margin: 10 }}>
      <h1>{params.dto.data.title}</h1>
      <div>
        <Button onClick={handleHtml}>HTML</Button>
        <Button onClick={handleDownload}>Download</Button>
        <Button onClick={handleRemove}>Remove</Button>
      </div>
      <Link target="_blank" href={params.dto.data.url.href}>
        <Typography sx={{ fontSize: '0.9em' }}>{decodeURI(params.dto.data.url.href)}</Typography>
      </Link>
      <div ref={divRef}></div>
      <p>snapshot {params.dto.createdAt}</p>
    </div>
  );
};
