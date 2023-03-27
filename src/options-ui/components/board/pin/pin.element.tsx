/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ObjPagePinDto, PinHtmlDataDto } from '../../../../common/model/obj/obj-pin.dto';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { BoardStore } from '../../../store/board.store';
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../../common/model/bus.model';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { IframeHtmlFactory } from '../../../../common/factory/iframe-html.factory';
import Link from '@mui/material/Link';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { fnDateFormat } from '../../../../common/fn/date.format.fn';
import { fnUid } from '../../../../common/fn/uid.fn';

interface PinElementParams {
  dto: ObjDto<ObjPagePinDto>;
  refreshBoardCallback: () => void;
}

export const PinElement: FunctionComponent<PinElementParams> = ({ dto, refreshBoardCallback }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && !divRef.current?.firstChild && dto.data.html.screenshot) {
      const img = new Image();
      img.width = window.innerWidth / 3;
      img.src = dto.data.html.screenshot;
      divRef.current.appendChild(img);
    }
  });

  const formatPinDate = (isoDt: number): string => {
    return fnDateFormat(new Date(isoDt));
  };

  const handleUrlClick = async () => {
    await BrowserStorageWrapper.set(ObjectStoreKeys.PIN_NAVIGATE, dto);
  };

  const handleDownload = async () => {
    const html = IframeHtmlFactory.computeHtml(dto.data.html.css, dto.data.html.html) || '';
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
    TinyEventDispatcher.dispatch<PinHtmlDataDto>(BusMessageType.OPT_SHOW_HTML, dto.data.html);
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(dto)) {
      refreshBoardCallback();
    }
  };

  return (
    <Card variant="outlined" style={{ margin: 5 }}>
      <CardHeader title={dto.data.title} subheader={formatPinDate(dto.createdAt)} />
      <CardContent>
        <div>
          <Button onClick={handleHtml}>HTML</Button>
          <Button onClick={handleDownload}>Download</Button>
          <Button onClick={handleRemove}>Remove</Button>
        </div>
        <div style={{ overflow: 'auto', maxHeight: window.innerHeight, maxWidth: window.innerWidth - 350 }}>
          <div ref={divRef}></div>
        </div>
      </CardContent>
      <CardActions>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '1.1em' }}>{dto.data.title}</Typography>
          <Link target="_blank" href={dto.data.url.href} onClick={() => handleUrlClick()}>
            <Typography sx={{ fontSize: '0.9em' }}>{dto.data.url.origin}</Typography>
          </Link>
        </div>
      </CardActions>
    </Card>
  );
};
