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
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { NoteListExpandComponent } from '../obj/note-list-expand.component';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import Typography from '@mui/material/Typography';

interface Props {
  obj: ObjDto<ObjPageNoteDto>;
  editCallback: (obj: ObjDto<ObjPageNoteDto>) => void;
}

export const NoteElementComponent: FunctionComponent<Props> = ({ obj, editCallback }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePopover = (): void => {
    setIsExpanded(!isExpanded);
  };

  const expandIcon = isExpanded ? (
    <ExpandMoreIcon sx={{ fontSize: '12px' }} />
  ) : (
    <NavigateNextIcon sx={{ fontSize: '12px' }} />
  );
  const expandComponent = isExpanded ? <NoteListExpandComponent note={obj} /> : '';

  const title = obj.data.title.length > 50 ? `${obj.data.title.substring(0, 50)}...` : obj.data.title;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px' }} onClick={handlePopover}>
          {title}
        </Typography>
        <div>
          <IconButton size="small" onClick={() => editCallback(obj)}>
            <EditIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <IconButton size="small" onClick={handlePopover}>
            {expandIcon}
          </IconButton>
        </div>
      </div>
      {expandComponent}
    </div>
  );
};
