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
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { ObjNoteDto } from '../../../common/model/obj/obj-note.dto';
import { marked } from 'marked';

interface NoteElementExpandComponentProps {
  note: ObjNoteDto;
  visible: boolean;
}

export const NoteElementExpandComponent: FunctionComponent<NoteElementExpandComponentProps> = ({ note, visible }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = marked(note.description);
  }, []);
  return (
    <div
      style={{
        width: '290px',
        padding: 5,
        marginLeft: 5,
        position: 'relative',
        display: visible ? 'inline-block' : 'none'
      }}
    >
      <div ref={ref}></div>
    </div>
  );
};
