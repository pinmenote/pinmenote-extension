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
import { BusMessageType } from '../../../../common/model/bus.model';
import ClearIcon from '@mui/icons-material/Clear';
import HtmlIcon from '@mui/icons-material/Html';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjSnapshotDto } from '../../../../common/model/obj/obj-snapshot.dto';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

interface PageSnapshotElementParams {
  dto: ObjDto<ObjSnapshotDto>;
  refreshBoardCallback: () => void;
}

export const PageSnapshotElement: FunctionComponent<PageSnapshotElementParams> = ({ dto, refreshBoardCallback }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && !divRef.current?.firstChild && dto.data.screenshot) {
      const img = new Image();
      img.width = window.innerWidth / 4;
      img.src = dto.data.screenshot;
      divRef.current.appendChild(img);
    }
  });

  const handleHtml = () => {
    TinyEventDispatcher.dispatch<ObjSnapshotDto>(BusMessageType.OPT_SHOW_HTML, dto.data);
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(dto)) {
      refreshBoardCallback();
    }
  };

  const title = dto.data.title.length > 50 ? `${dto.data.title.substring(0, 50)}...` : dto.data.title;
  const url =
    decodeURI(dto.data.url.href).length > 50
      ? decodeURI(dto.data.url.href).substring(0, 50)
      : decodeURI(dto.data.url.href);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: window.innerWidth / 4, margin: 10 }}>
      <h2 style={{ wordWrap: 'break-word' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <IconButton title="HTML view" onClick={handleHtml}>
          <HtmlIcon />
        </IconButton>
        <IconButton title="Remove" onClick={handleRemove}>
          <ClearIcon />
        </IconButton>
      </div>
      <div ref={divRef}></div>
      <Link target="_blank" href={dto.data.url.href}>
        <Typography sx={{ fontSize: '0.9em' }}>{url}</Typography>
      </Link>
      <p>page snapshot {dto.createdAt}</p>
    </div>
  );
};
