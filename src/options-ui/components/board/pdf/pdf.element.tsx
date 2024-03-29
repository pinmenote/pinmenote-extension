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
import { ObjPdfDto } from '../../../../common/model/obj/obj-pdf.dto';
import { ObjHashtag } from '../../../../common/model/obj/obj-hashtag.dto';
import { BoardItemMediator } from '../board-item.mediator';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { TagHelper } from '../../../../common/components/tag-editor/tag.helper';

interface Props {
  dto: ObjDto<ObjPdfDto>;
  refreshBoardCallback: () => void;
}

export const PdfElement: FunctionComponent<Props> = (props) => {
  const [hashtags, setHashtags] = useState<ObjHashtag[]>(props.dto.data.hashtags?.data || []);
  const [objRemove, setObjRemove] = useState<ObjDto | undefined>();

  const handleEdit = () => {
    fnConsoleLog('EDIT !!!');
  };

  const handleHtml = () => {
    window.location.hash = `pdf/${props.dto.id}`;
  };

  const handleRemove = () => {
    setObjRemove(props.dto);
  };
  const handleRemoveCallback = async (obj?: ObjDto) => {
    if (obj) await BoardItemMediator.removeObject(props.dto, props.refreshBoardCallback);
    setObjRemove(undefined);
  };

  return (
    <BoardItem obj={objRemove} handleRemove={handleRemoveCallback}>
      <BoardItemTitle
        obj={props.dto}
        htmlCallback={handleHtml}
        editCallback={handleEdit}
        removeCallback={handleRemove}
      />
      <img
        style={{ height: '100%', width: '100%', objectFit: 'contain', maxHeight: 220, cursor: 'pointer' }}
        src={props.dto.data.data.screenshot}
        onClick={handleHtml}
      />
      <div style={{ display: 'flex', flexGrow: 1 }}></div>
      <BoardItemFooter
        saveTags={(newTags) => TagHelper.saveTags(props.dto, newTags, setHashtags)}
        title="page snapshot"
        createdAt={props.dto.createdAt}
        tags={hashtags}
        words={[]}
        url={props.dto.data.data.rawUrl}
      />
    </BoardItem>
  );
};
