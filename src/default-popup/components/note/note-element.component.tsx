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
import { NoteElementExpandComponent } from './note-element-expand.component';
import { ObjNoteDto } from '../../../common/model/obj/obj-note.dto';
import Typography from '@mui/material/Typography';

interface NoteElementComponentProps {
  note: ObjNoteDto;
}

export const NoteElementComponent: FunctionComponent<NoteElementComponentProps> = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div>
      <Typography>{note.title}</Typography>
      <NoteElementExpandComponent note={note} />
    </div>
  );
};
