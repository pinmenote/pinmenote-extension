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
import React, { FunctionComponent } from 'react';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../common/model/obj/obj-page.dto';
import { TagEditor } from '../../../common/components/tag-editor/tag-editor';
import { TagHelper } from '../../../common/command/tags/tag.helper';

interface Props {
  obj: ObjDto<ObjPageDto>;
}

export const SnapshotListExpandComponent: FunctionComponent<Props> = ({ obj }) => {
  return (
    <div
      style={{
        width: '290px',
        padding: 5,
        marginLeft: 5,
        position: 'relative'
      }}
    >
      <TagEditor
        tags={obj.data.hashtags?.data || []}
        width={280}
        saveCallback={(newTags) => TagHelper.saveTags(obj, newTags)}
      />
      <img src={obj.data.snapshot.data.screenshot} width="280" />
    </div>
  );
};
