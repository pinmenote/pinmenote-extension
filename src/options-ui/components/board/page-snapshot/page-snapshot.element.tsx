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
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { ObjHashtag } from '../../../../common/model/obj/obj-hashtag.dto';
import { BoardItemMediator } from '../board-item.mediator';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

interface Props {
  dto: ObjDto<ObjPageDto>;
  refreshBoardCallback: () => void;
}

export const PageSnapshotElement: FunctionComponent<Props> = (props) => {
  const [hashtags, setHashtags] = useState<ObjHashtag[]>(props.dto.data.hashtags?.data || []);

  const handleEdit = () => {
    fnConsoleLog('EDIT !!!');
  };

  const handleHtml = () => {
    window.location.hash = `obj/${props.dto.id}`;
  };

  return (
    <BoardItem>
      <BoardItemTitle
        title={props.dto.data.snapshot.info.title}
        editCallback={handleEdit}
        htmlCallback={handleHtml}
        removeCallback={() => BoardItemMediator.removeObject(props.dto, props.refreshBoardCallback)}
      />
      <img
        style={{ height: '100%', width: '100%', objectFit: 'contain', maxHeight: 220 }}
        src={props.dto.data.snapshot.data.screenshot}
      />
      <div style={{ display: 'flex', flexGrow: 1 }}></div>
      <BoardItemFooter
        saveTags={(newTags) => BoardItemMediator.saveTags(props.dto, newTags, setHashtags)}
        title="page snapshot"
        createdAt={props.dto.createdAt}
        tags={hashtags}
        words={props.dto.data.snapshot.info.words}
        url={props.dto.data.snapshot.info.url.href}
      />
    </BoardItem>
  );
};
