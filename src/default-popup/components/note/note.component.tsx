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
import React, { FunctionComponent, useEffect, useState } from 'react';
import { NoteAddComponent } from './add/note-add.component';
import { NoteEditComponent } from './add/note-edit.component';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';

enum CurrentView {
  NOTE_ADD = 'NOTE_ADD',
  NOTE_EDIT = 'NOTE_EDIT'
}

interface Props {
  editNote?: ObjDto<ObjPageNoteDto>;
  currentView: string;
  addCallback: () => void;
  cancelCallback: () => void;
}

export const NoteComponent: FunctionComponent<Props> = (props) => {
  const [state, setState] = useState<CurrentView>(props.currentView as CurrentView);

  useEffect(() => {
    if (props.editNote) setState(CurrentView.NOTE_EDIT);
  }, []);

  const getComponent = (state: CurrentView) => {
    switch (state) {
      case CurrentView.NOTE_ADD:
        return <NoteAddComponent addCallback={props.addCallback} cancelCallback={props.cancelCallback} />;
      case CurrentView.NOTE_EDIT:
        if (!props.editNote) return;
        return (
          <NoteEditComponent
            editNote={props.editNote}
            addCallback={props.addCallback}
            cancelCallback={props.cancelCallback}
          />
        );
    }
  };

  const component = getComponent(state);

  return <div>{component}</div>;
};
