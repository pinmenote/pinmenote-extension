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
import { NoteNewComponent } from './note-new.component';
import { TaskNewComponent } from './task-new.component';

export const TaskNoteComponent: FunctionComponent = () => {
  const [selected, setSelected] = useState<string>('task');
  const handleTaskClick = () => {
    setSelected('task');
  };

  const handleNoteClick = () => {
    setSelected('note');
  };
  return (
    <div>
      <div
        style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            width: 150,
            fontSize: '1.5em',
            textAlign: 'center',
            fontWeight: selected === 'task' ? 'bold' : ''
          }}
          onClick={handleTaskClick}
        >
          Task
        </div>
        <div style={{ fontSize: '2em', userSelect: 'none' }}>|</div>
        <div
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            width: 150,
            fontSize: '1.5em',
            textAlign: 'center',
            fontWeight: selected === 'note' ? 'bold' : ''
          }}
          onClick={handleNoteClick}
        >
          Note
        </div>
      </div>
      <div style={{ display: selected === 'task' ? 'inline-block' : 'none' }}>
        <TaskNewComponent />
      </div>
      <div style={{ display: selected === 'note' ? 'inline-block' : 'none' }}>
        <NoteNewComponent />
      </div>
    </div>
  );
};
