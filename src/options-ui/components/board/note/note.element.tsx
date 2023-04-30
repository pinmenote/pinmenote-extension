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
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { NoteUpdateCommand } from '../../../../common/command/note/note-update.command';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjNoteDto } from '../../../../common/model/obj/obj-note.dto';
import { TitleEditComponent } from '../edit/title-edit.component';
import Typography from '@mui/material/Typography';
import { WordIndex } from '../../../../common/text/index/word.index';
import { marked } from 'marked';

interface PinElementParams {
  dto: ObjDto<ObjNoteDto>;
  refreshBoardCallback: () => void;
}

export const NoteElement: FunctionComponent<PinElementParams> = ({ dto, refreshBoardCallback }) => {
  const [editTitle, setEditTitle] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = marked(dto.data.description);
  }, []);

  const handleEditTitle = () => {
    setEditTitle(true);
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(dto)) {
      refreshBoardCallback();
    }
  };

  const titleSaveCallback = async (value: string) => {
    if (dto.data.title !== value) {
      dto.data.title = value;
      dto.updatedAt = Date.now();
      const words = new Set<string>([...WordIndex.toWordList(title), ...WordIndex.toWordList(dto.data.description)]);
      const oldWords = dto.data.words.slice();
      dto.data.words = Array.from(words);
      await new NoteUpdateCommand(dto, oldWords).execute();
    }
    setEditTitle(false);
  };

  const titleCancelCallback = () => {
    setEditTitle(false);
  };

  const title = dto.data.title.length > 50 ? `${dto.data.title.substring(0, 50)}...` : dto.data.title;
  let url = '';
  if (dto.data.url) {
    url =
      decodeURI(dto.data.url.href).length > 50
        ? decodeURI(dto.data.url.href).substring(0, 50)
        : decodeURI(dto.data.url.href);
  }

  const titleElement = editTitle ? (
    <TitleEditComponent value={dto.data.title} saveCallback={titleSaveCallback} cancelCallback={titleCancelCallback} />
  ) : (
    <h2 style={{ wordWrap: 'break-word', width: '80%' }}>{title}</h2>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: window.innerWidth / 4,
        margin: 10,
        border: '1px solid #eeeeee',
        padding: 10
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        {titleElement}
        <div style={{ display: editTitle ? 'none' : 'flex', flexDirection: 'row' }}>
          <IconButton onClick={handleEditTitle}>
            <EditIcon />
          </IconButton>
          <IconButton title="Remove" onClick={handleRemove}>
            <ClearIcon />
          </IconButton>
        </div>
      </div>
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
      <p>page note {dto.createdAt}</p>
    </div>
  );
};
