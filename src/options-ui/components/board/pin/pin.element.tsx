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
import { BoardStore } from '../../../store/board.store';
import { BusMessageType } from '../../../../common/model/bus.model';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import HtmlIcon from '@mui/icons-material/Html';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../../common/model/obj/obj-pin.dto';
import { ObjSnapshotDto } from '../../../../common/model/obj/obj-snapshot.dto';
import { PinUpdateCommand } from '../../../../common/command/pin/pin-update.command';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import { TitleEditComponent } from '../edit/title-edit.component';
import Typography from '@mui/material/Typography';

interface PinElementParams {
  dto: ObjDto<ObjPagePinDto>;
  refreshBoardCallback: () => void;
}

export const PinElement: FunctionComponent<PinElementParams> = ({ dto, refreshBoardCallback }) => {
  const [editTitle, setEditTitle] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && !divRef.current?.firstChild && dto.data.snapshot.screenshot) {
      const img = new Image();
      img.width = window.innerWidth / 4;
      img.src = dto.data.snapshot.screenshot;
      divRef.current.appendChild(img);
    }
  });

  const handleEditTitle = () => {
    setEditTitle(true);
  };

  const handleHtml = () => {
    TinyEventDispatcher.dispatch<ObjSnapshotDto>(BusMessageType.OPT_SHOW_HTML, dto.data.snapshot);
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(dto)) {
      refreshBoardCallback();
    }
  };

  const titleSaveCallback = async (value: string) => {
    if (dto.data.snapshot.title !== value) {
      dto.data.snapshot.title = value;
      dto.updatedAt = Date.now();
      await new PinUpdateCommand(dto).execute();
    }
    setEditTitle(false);
  };

  const titleCancelCallback = () => {
    setEditTitle(false);
  };

  const title =
    dto.data.snapshot.title.length > 50 ? `${dto.data.snapshot.title.substring(0, 50)}...` : dto.data.snapshot.title;
  const url =
    decodeURI(dto.data.snapshot.url.href).length > 50
      ? decodeURI(dto.data.snapshot.url.href).substring(0, 50)
      : decodeURI(dto.data.snapshot.url.href);
  const titleElement = editTitle ? (
    <TitleEditComponent
      value={dto.data.snapshot.title}
      saveCallback={titleSaveCallback}
      cancelCallback={titleCancelCallback}
    />
  ) : (
    <h2 style={{ wordWrap: 'break-word', width: '80%' }}>{title}</h2>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: window.innerWidth / 4, margin: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        {titleElement}
        <div style={{ display: editTitle ? 'none' : 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <IconButton title="HTML view" onClick={handleHtml}>
            <HtmlIcon />
          </IconButton>
          <IconButton onClick={handleEditTitle}>
            <EditIcon />
          </IconButton>
          <IconButton title="Remove" onClick={handleRemove}>
            <ClearIcon />
          </IconButton>
        </div>
      </div>
      <div ref={divRef}></div>
      <Link target="_blank" href={dto.data.snapshot.url.href}>
        <Typography sx={{ fontSize: '0.9em' }}>{url}</Typography>
      </Link>
      <p>page pin {dto.createdAt}</p>
    </div>
  );
};
