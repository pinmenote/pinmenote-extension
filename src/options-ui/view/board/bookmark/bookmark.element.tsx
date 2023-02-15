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
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { Button } from '@mui/material';
import { IframeHtmlFactory } from '../../../../common/factory/iframe-html.factory';
import Link from '@mui/material/Link';
import { ObjBookmarkDto } from '../../../../common/model/obj-bookmark.model';
import { ObjDto } from '../../../../common/model/obj.model';
import Typography from '@mui/material/Typography';
import { fnUid } from '../../../../common/fn/uid.fn';

interface BookmarkElementParams {
  dto: ObjDto<ObjBookmarkDto>;
}

export const BookmarkElement: FunctionComponent<BookmarkElementParams> = (params) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && params.dto.data.screenshot) {
      const img = new Image();
      img.width = window.innerWidth / 3;
      img.src = params.dto.data.screenshot;
      divRef.current.appendChild(img);
    }
  });

  const handleDownload = async () => {
    const html = IframeHtmlFactory.computeBookmarkHtml(params.dto.data) || '';
    // https://stackoverflow.com/a/54302120 handle utf-8 string download
    const url = window.URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'text/html' }));
    const filename = `${fnUid()}.html`;
    await BrowserApi.downloads.download({
      url,
      filename,
      conflictAction: 'uniquify'
    });
  };

  return (
    <div>
      <h1>{params.dto.data.title}</h1>
      <div>
        <Button onClick={handleDownload}>Download</Button>
      </div>
      <Link target="_blank" href={params.dto.data.url.href}>
        <Typography sx={{ fontSize: '0.9em' }}>{decodeURI(params.dto.data.url.href)}</Typography>
      </Link>
      <div ref={divRef}></div>
      <p>bookmark</p>
    </div>
  );
};
