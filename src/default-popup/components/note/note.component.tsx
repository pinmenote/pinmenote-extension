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
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { NoteAddComponent } from './add/note-add.component';
import { NoteListComponent } from './note-list.component';

enum CurrentView {
  NOTE_LIST = 'NOTE_LIST',
  NOTE_ADD = 'NOTE_ADD'
}

export const NoteComponent: FunctionComponent = () => {
  const [state, setState] = useState<CurrentView>(CurrentView.NOTE_LIST);
  const handleAddNote = () => {
    setState(CurrentView.NOTE_LIST);
  };

  const getComponent = (state: CurrentView) => {
    switch (state) {
      case CurrentView.NOTE_ADD:
        return <NoteAddComponent addCallback={handleAddNote} cancelCallback={() => setState(CurrentView.NOTE_LIST)} />;
      case CurrentView.NOTE_LIST:
        return <NoteListComponent />;
    }
  };

  const component = getComponent(state);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <h2>Notes</h2>
        <IconButton onClick={() => setState(CurrentView.NOTE_ADD)}>
          <AddIcon />
        </IconButton>
      </div>
      {component}
    </div>
  );
};
