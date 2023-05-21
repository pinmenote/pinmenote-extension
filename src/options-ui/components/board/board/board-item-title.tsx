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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HtmlIcon from '@mui/icons-material/Html';
import IconButton from '@mui/material/IconButton';
import { ObjDto } from '../../../../common/model/obj/obj.dto';

interface Props {
  title: string;
  dto: ObjDto;
  editCallback: (dto: ObjDto) => void;
  removeCallback: (dto: ObjDto) => void;
  htmlCallback?: (dto: ObjDto) => void;
}

export const BoardItemTitle: FunctionComponent<Props> = (props) => {
  const title = props.title.length > 50 ? `${props.title.substring(0, 50)}...` : props.title;

  const htmlEdit = props.htmlCallback ? (
    <IconButton title="HTML view" onClick={() => props.htmlCallback()}>
      <HtmlIcon />
    </IconButton>
  ) : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <h2 style={{ overflowWrap: 'anywhere', width: '80%' }} title={props.title}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {htmlEdit}
        <IconButton onClick={() => props.editCallback(props.dto)}>
          <EditIcon />
        </IconButton>
        <IconButton title="Remove" onClick={() => props.removeCallback(props.dto)}>
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
};
