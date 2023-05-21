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
import React, { FunctionComponent, useState } from 'react';
import { BoardItem } from '../board-item';
import { BoardStore } from '../../../store/board.store';
import { BoardTitle } from '../board/board-title';
import { BusMessageType } from '../../../../common/model/bus.model';
import Link from '@mui/material/Link';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../../common/model/obj/obj-pin.dto';
import { ObjSnapshotDto } from '../../../../common/model/obj/obj-snapshot.dto';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

interface PinElementParams {
  dto: ObjDto<ObjPagePinDto>;
  refreshBoardCallback: () => void;
}

export const PinElement: FunctionComponent<PinElementParams> = ({ dto, refreshBoardCallback }) => {
  const [edit, setEdit] = useState<boolean>(false);

  const handleEdit = () => {
    setEdit(true);
  };

  const handleHtml = () => {
    TinyEventDispatcher.dispatch<ObjSnapshotDto>(BusMessageType.OPT_SHOW_HTML, dto.data.snapshot);
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(dto)) {
      refreshBoardCallback();
    }
  };

  const title =
    dto.data.snapshot.title.length > 50 ? `${dto.data.snapshot.title.substring(0, 50)}...` : dto.data.snapshot.title;
  const url =
    decodeURI(dto.data.snapshot.url.href).length > 50
      ? decodeURI(dto.data.snapshot.url.href).substring(0, 50)
      : decodeURI(dto.data.snapshot.url.href);

  return (
    <BoardItem>
      <BoardTitle
        title={title}
        dto={dto}
        editCallback={handleEdit}
        htmlCallback={handleHtml}
        removeCallback={handleRemove}
      />
      <div>
        <img src={dto.data.snapshot.screenshot} />
      </div>
      <div>
        <Link target="_blank" href={dto.data.snapshot.url.href}>
          <Typography sx={{ fontSize: '0.9em' }}>{url}</Typography>
        </Link>
        <p>page pin {dto.createdAt}</p>
        <p>{dto.data.snapshot.words.join(', ')}</p>
      </div>
    </BoardItem>
  );
};
