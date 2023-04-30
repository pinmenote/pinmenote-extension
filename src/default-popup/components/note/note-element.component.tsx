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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { NoteElementExpandComponent } from './note-element-expand.component';
import { ObjNoteDto } from '../../../common/model/obj/obj-note.dto';
import Typography from '@mui/material/Typography';

interface NoteElementComponentProps {
  note: ObjNoteDto;
}

export const NoteElementComponent: FunctionComponent<NoteElementComponentProps> = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePopover = (): void => {
    setIsExpanded(!isExpanded);
  };

  const expandIcon = isExpanded ? (
    <ExpandMoreIcon sx={{ fontSize: '12px' }} />
  ) : (
    <NavigateNextIcon sx={{ fontSize: '12px' }} />
  );
  const title = note.title.length > 50 ? `${note.title.substring(0, 50)}...` : note.title;
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
        <IconButton size="small" onClick={handlePopover}>
          {expandIcon}
        </IconButton>
      </div>
      <NoteElementExpandComponent visible={isExpanded} note={note} />
    </div>
  );
};
