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
import { BoardItem } from '../board-item';
import { BoardStore } from '../../../store/board.store';
import { BoardTitle } from '../board/board-title';
import Link from '@mui/material/Link';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjNoteDto } from '../../../../common/model/obj/obj-note.dto';
import Typography from '@mui/material/Typography';
import { marked } from 'marked';

interface PinElementParams {
  dto: ObjDto<ObjNoteDto>;
  refreshBoardCallback: () => void;
}

export const NoteElement: FunctionComponent<PinElementParams> = ({ dto, refreshBoardCallback }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = marked(dto.data.description);
  }, []);

  const handleEdit = () => {
    setEdit(true);
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(dto)) {
      refreshBoardCallback();
    }
  };

  const title = dto.data.title.length > 50 ? `${dto.data.title.substring(0, 50)}...` : dto.data.title;
  let url = '';
  if (dto.data.url) {
    url =
      decodeURI(dto.data.url.href).length > 50
        ? decodeURI(dto.data.url.href).substring(0, 50)
        : decodeURI(dto.data.url.href);
  }
  return (
    <BoardItem>
      <BoardTitle title={title} dto={dto} editCallback={handleEdit} removeCallback={handleRemove} />
      <div>
        <div ref={ref}></div>
      </div>
      <Link
        target="_blank"
        style={{ marginTop: 5, display: dto.data.url ? 'inline-block' : 'none' }}
        href={dto.data.url?.href}
      >
        <Typography fontSize="0.9em">{url}</Typography>
      </Link>
      <div>
        <p>page note {dto.createdAt}</p>
        <p>{dto.data.words.join(', ')}</p>
      </div>
    </BoardItem>
  );
};
