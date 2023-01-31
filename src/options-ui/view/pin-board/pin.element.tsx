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
import { ObjBoardViewDto, ObjDto } from '../../../common/model/obj.model';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinValueElement } from './pin.value.element';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { fnDateFormat } from '../../../common/fn/date.format.fn';
import { pinIframeFn } from '../../../common/fn/pin/pin.iframe.fn';

interface PinElementParams {
  pin: ObjDto<ObjPagePinDto>;
}

export const PinElement: FunctionComponent<PinElementParams> = ({ pin }) => {
  const divRef = useRef<HTMLDivElement>(null);

  const renderDiv = (ref: HTMLDivElement) => {
    if (!pin.local.boardView || pin.local.boardView === ObjBoardViewDto.Screenshot) {
      const img = new Image();
      img.src = pin.data.html[0].screenshot || '';
      ref.appendChild(img);
    } else {
      pinIframeFn(pin.data.html[0], ref);
    }
  };

  useEffect(() => {
    if (divRef.current && !divRef.current?.firstChild) {
      renderDiv(divRef.current);
    }
    const skipKey = TinyEventDispatcher.addListener<ObjDto<ObjPagePinDto>>(
      BusMessageType.OPT_PIN_SHOW_IMAGE,
      (event, key, value) => {
        if (value.id === pin.id) {
          if (divRef.current?.firstChild) {
            divRef.current.removeChild(divRef.current.firstChild);
            renderDiv(divRef.current);
          }
        }
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_PIN_SHOW_IMAGE, skipKey);
    };
  });

  const formatPinDate = (isoDt: string): string => {
    return fnDateFormat(new Date(isoDt));
  };

  const handleUrlClick = async () => {
    await BrowserStorageWrapper.set(ObjectStoreKeys.PIN_NAVIGATE, pin);
  };

  return (
    <Card variant="outlined" style={{ margin: 5 }}>
      <CardHeader title={<PinValueElement pin={pin} />} subheader={formatPinDate(pin.createdAt)} />
      <CardContent>
        <div style={{ overflow: 'auto', maxHeight: window.innerHeight, maxWidth: window.innerWidth - 350 }}>
          <div ref={divRef}></div>
        </div>
      </CardContent>
      <CardActions>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '1.1em' }}>{pin.data.title}</Typography>
          <Link target="_blank" href={pin.data.url.href} onClick={() => handleUrlClick()}>
            <Typography sx={{ fontSize: '0.9em' }}>{pin.data.url.origin}</Typography>
          </Link>
        </div>
      </CardActions>
    </Card>
  );
};
