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
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

interface Props {
  dto: ObjDto<ObjPageDto>;
  refreshBoardCallback: () => void;
}

export const PageSnapshotElement: FunctionComponent<Props> = (props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [hashtags, setHashtags] = useState<string[]>(props.dto.data.snapshot.info.hashtags || []);

  const handleEdit = () => {
    setEdit(true);
  };

  const handleHtml = () => {
    window.location.hash = `obj/${props.dto.id}`;
  };

  const handleRemove = async () => {
    if (await BoardStore.removeObj(props.dto)) {
      props.refreshBoardCallback();
    }
  };

  const handleTagSave = (newTags: string[]) => {
    props.dto.data.snapshot.info.hashtags = newTags;
    setHashtags(newTags);
    fnConsoleLog('PageSnapshotElement->handleTagSave->newTags', newTags);
  };

  return (
    <BoardItem>
      <BoardItemTitle
        title={props.dto.data.snapshot.info.title}
        editCallback={handleEdit}
        htmlCallback={handleHtml}
        removeCallback={handleRemove}
      />
      <img
        style={{ height: '100%', width: '100%', objectFit: 'contain', maxHeight: 220 }}
        src={props.dto.data.snapshot.data.screenshot}
      />
      <div style={{ display: 'flex', flexGrow: 1 }}></div>
      <BoardItemFooter
        saveTags={handleTagSave}
        title="page snapshot"
        createdAt={props.dto.createdAt}
        tags={hashtags}
        words={props.dto.data.snapshot.info.words}
        url={props.dto.data.snapshot.info.url.href}
      />
    </BoardItem>
  );
};
