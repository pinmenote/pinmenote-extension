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
import { BoardItem } from '../board/board-item';
import { BoardItemFooter } from '../board/board-item-footer';
import { BoardItemTitle } from '../board/board-item-title';
import { BoardStore } from '../../../store/board.store';
import { BusMessageType } from '../../../../common/model/bus.model';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../../common/model/obj/obj-pin.dto';
import { ObjSnapshotDto } from '../../../../common/model/obj/obj-snapshot.dto';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';

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

  return (
    <BoardItem>
      <BoardItemTitle
        title={dto.data.snapshot.title}
        dto={dto}
        editCallback={handleEdit}
        htmlCallback={handleHtml}
        removeCallback={handleRemove}
      />
      <div></div>
      <img src={dto.data.snapshot.screenshot} />
      <div style={{ display: 'flex', flexGrow: 1 }}></div>
      <BoardItemFooter
        title="page pin"
        createdAt={dto.createdAt}
        words={dto.data.snapshot.words}
        url={dto.data.snapshot.url?.href}
      />
    </BoardItem>
  );
};
