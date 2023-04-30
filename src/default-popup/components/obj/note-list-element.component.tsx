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
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { NoteListExpandComponent } from './note-list-expand.component';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjNoteDto } from '../../../common/model/obj/obj-note.dto';
import Typography from '@mui/material/Typography';

interface NoteListElementComponentProps {
  obj: ObjDto<ObjNoteDto>;
  removeCallback: (note: ObjDto<ObjNoteDto>) => void;
}

export const NoteListElementComponent: FunctionComponent<NoteListElementComponentProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNoteRemove = (data: ObjDto<ObjNoteDto>): void => {
    props.removeCallback(data);
  };

  const handlePopover = (): void => {
    setIsExpanded(!isExpanded);
  };

  const expandIcon = isExpanded ? (
    <ExpandMoreIcon sx={{ fontSize: '12px' }} />
  ) : (
    <NavigateNextIcon sx={{ fontSize: '12px' }} />
  );
  const value = props.obj.data.title;
  const title = value.length > 30 ? `${value.substring(0, 30)}...` : value;

  return (
    <div style={{ width: '100%', marginBottom: 15 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ color: '#777777' }}>
            <NoteOutlinedIcon />
          </div>
          <IconButton size="small" onClick={handlePopover}>
            {expandIcon}
          </IconButton>
          <Typography style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px' }} onClick={handlePopover}>
            {title}
          </Typography>
        </div>
        <div
          style={{
            textAlign: 'right',
            marginRight: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <IconButton title="Remove note" size="small" onClick={() => handleNoteRemove(props.obj)}>
            <CloseIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        </div>
      </div>
      <NoteListExpandComponent visible={isExpanded} note={props.obj} />
    </div>
  );
};
