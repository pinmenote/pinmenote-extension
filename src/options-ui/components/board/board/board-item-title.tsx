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
import { ObjDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { ObjTitleFactory } from '../../../../common/factory/obj-title.factory';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface Props {
  obj: ObjDto;
  editCallback: () => void;
  removeCallback: () => void;
  htmlCallback?: () => void;
}

export const BoardItemTitle: FunctionComponent<Props> = (props) => {
  const titleData = ObjTitleFactory.computeTitleSize(props.obj, 50);

  const htmlClick = () => {
    if (props.htmlCallback) props.htmlCallback();
  };

  const icon = props.obj.type === ObjTypeDto.Pdf ? <PictureAsPdfIcon /> : <HtmlIcon />;

  const htmlIcon = props.htmlCallback ? (
    <IconButton title="HTML view" onClick={htmlClick}>
      {icon}
    </IconButton>
  ) : undefined;

  const editIcon = [ObjTypeDto.PageSnapshot, ObjTypeDto.PageElementSnapshot].includes(props.obj.type) ? (
    <IconButton onClick={() => props.editCallback()}>
      <EditIcon />
    </IconButton>
  ) : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <h2
        style={{ overflowWrap: 'anywhere', width: '80%', userSelect: 'none', cursor: 'pointer' }}
        onClick={htmlClick}
        title={titleData.title}
      >
        {titleData.small}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {htmlIcon}
        {editIcon}
        <IconButton title="Remove" onClick={() => props.removeCallback()}>
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
};
