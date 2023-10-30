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
import { PageSnapshotClearTitleCommand } from '../../../../common/command/snapshot/page-snapshot-clear-title.command';
import { PageSnapshotUpdateTitleCommand } from '../../../../common/command/snapshot/page-snapshot-update-title.command';
import { fnDeepCopy } from '../../../../common/fn/fn-copy';
import { fnSha256Object } from '../../../../common/fn/fn-hash';
import { ObjOverrideDto } from '../../../../common/model/obj/obj-override.dto';
import { BoardItem } from '../board/board-item';
import { BoardItemFooter } from '../board/board-item-footer';
import { BoardItemTitle } from '../board/board-item-title';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { ObjHashtag } from '../../../../common/model/obj/obj-hashtag.dto';
import { BoardItemMediator } from '../board-item.mediator';
import { TagHelper } from '../../../../common/components/tag-editor/tag.helper';
import { BoardItemTitleEdit } from '../board/board-item-title-edit';

interface Props {
  obj: ObjDto<ObjPageDto>;
  refreshBoardCallback: () => void;
}

export const PageSnapshotElement: FunctionComponent<Props> = (props) => {
  const [hashtags, setHashtags] = useState<ObjHashtag[]>(props.obj.data.hashtags?.data || []);
  const [objRemove, setObjRemove] = useState<ObjDto | undefined>();
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleEdit = () => {
    setIsEdit(true);
  };

  const handleHtml = () => {
    window.location.hash = `obj/${props.obj.id}`;
  };

  const handleRemove = () => {
    setObjRemove(props.obj);
  };

  const handleRemoveCallback = async (obj?: ObjDto) => {
    if (obj) await BoardItemMediator.removeObject(props.obj, props.refreshBoardCallback);
    setObjRemove(undefined);
  };

  const handleEditSave = async (title: string) => {
    let override: Omit<ObjOverrideDto, 'hash'> = { title };
    if (props.obj.data.snapshot.override) {
      const copy = fnDeepCopy(props.obj.data.snapshot.override);
      delete copy['hash'];
      override = { ...copy, title };
    }
    const hash = fnSha256Object(override);
    await new PageSnapshotUpdateTitleCommand(props.obj, { ...override, hash }).execute();
    setIsEdit(false);
  };

  const handleEditRestore = async () => {
    await new PageSnapshotClearTitleCommand(props.obj).execute();
    setIsEdit(false);
  };

  const handleEditCancel = () => {
    setIsEdit(false);
  };

  const title = isEdit ? (
    <BoardItemTitleEdit
      obj={props.obj}
      restoreCallback={handleEditRestore}
      saveCallback={handleEditSave}
      cancelCallback={handleEditCancel}
    />
  ) : (
    <BoardItemTitle obj={props.obj} editCallback={handleEdit} htmlCallback={handleHtml} removeCallback={handleRemove} />
  );

  return (
    <BoardItem obj={objRemove} handleRemove={handleRemoveCallback}>
      {title}
      <img
        style={{ height: '100%', width: '100%', objectFit: 'contain', maxHeight: 220, cursor: 'pointer' }}
        src={props.obj.data.snapshot.data.screenshot}
        onClick={handleHtml}
      />
      <BoardItemFooter
        saveTags={(newTags) => TagHelper.saveTags(props.obj, newTags, setHashtags)}
        title="page snapshot"
        createdAt={props.obj.createdAt}
        tags={hashtags}
        words={props.obj.data.snapshot.override?.words || props.obj.data.snapshot.info.words}
        url={props.obj.data.snapshot.info.url.href}
      />
    </BoardItem>
  );
};
