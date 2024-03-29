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
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageNoteDto } from '../../../../common/model/obj/obj-note.dto';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { marked } from 'marked';
import { ObjHashtag } from '../../../../common/model/obj/obj-hashtag.dto';
import { TagHelper } from '../../../../common/components/tag-editor/tag.helper';
import { BoardItemMediator } from '../board-item.mediator';

interface Props {
  dto: ObjDto<ObjPageNoteDto>;
  refreshBoardCallback: () => void;
}

export const PageNoteElement: FunctionComponent<Props> = (props) => {
  const [hashtags, setHashtags] = useState<ObjHashtag[]>(props.dto.data.hashtags?.data || []);
  const [objRemove, setObjRemove] = useState<ObjDto | undefined>();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = marked(props.dto.data.data.description).toString();
  }, []);

  const handleEdit = () => {
    fnConsoleLog('EDIT !!!');
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
      <BoardItemTitle obj={props.dto} editCallback={handleEdit} removeCallback={handleRemove} />
      <div>
        <div ref={ref}></div>
      </div>
      <div style={{ display: 'flex', flexGrow: 1 }}></div>
      <BoardItemFooter
        saveTags={(newTags) => TagHelper.saveTags(props.dto, newTags, setHashtags)}
        title="page note"
        tags={hashtags}
        createdAt={props.dto.createdAt}
        words={props.dto.data.data.words}
        url={props.dto.data.url?.href}
      />
    </BoardItem>
  );
};
