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
import { BoardItem } from '../board/board-item';
import { BoardItemFooter } from '../board/board-item-footer';
import { BoardItemTitle } from '../board/board-item-title';
import { BoardStore } from '../../../store/board.store';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjNoteDto } from '../../../../common/model/obj/obj-note.dto';
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

  return (
    <BoardItem>
      <BoardItemTitle title={dto.data.title} dto={dto} editCallback={handleEdit} removeCallback={handleRemove} />
      <div>
        <div ref={ref}></div>
      </div>
      <div style={{ display: 'flex', flexGrow: 1 }}></div>
      <BoardItemFooter title="page note" createdAt={dto.createdAt} words={dto.data.words} url={dto.data.url?.href} />
    </BoardItem>
  );
};
