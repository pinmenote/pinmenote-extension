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
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import React, { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { BusMessageType } from '../../../common/model/bus.model';
import { MainFooterButton } from './main-footer.button';
import { MainHeaderComponent } from './main-header.component';
import { MainMenuListComponent } from './main-menu-list.component';
import { MainViewEnum } from '../component-model';
import { NoteComponent } from '../note/note.component';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { ObjViewComponent } from '../obj/obj-view.component';
import { SavePageProgressComponent } from '../save-page-progress/save-page-progress.component';
import { PageNoteDraftGetCommand } from '../../../common/command/page-note/draft/page-note-draft-get.command';

export const MainViewComponent: FunctionComponent = () => {
  const [previousView, setPreviousView] = useState<MainViewEnum>(MainViewEnum.PAGE_OBJECTS);
  const [currentView, setCurrentView] = useState<MainViewEnum>(MainViewEnum.PAGE_OBJECTS);
  const [editNote, setEditNote] = useState<ObjDto<ObjPageNoteDto> | undefined>();

  useEffect(() => {
    new PageNoteDraftGetCommand()
      .execute()
      .then((note) => {
        if (note) {
          setCurrentView(MainViewEnum.NOTE);
          TinyDispatcher.getInstance().dispatch(BusMessageType.POP_IS_ADDING, true);
        }
      })
      .catch(() => {
        /* IGNORE */
      });
  });

  const changeMainTab = (viewType: MainViewEnum) => {
    setPreviousView(currentView);
    setCurrentView(viewType);
  };

  const editNoteCallback = (obj: ObjDto<ObjPageNoteDto>) => {
    setEditNote(obj);
    setCurrentView(MainViewEnum.NOTE);
  };

  const saveCancelNoteCallback = () => {
    setCurrentView(MainViewEnum.PAGE_OBJECTS);
    TinyDispatcher.getInstance().dispatch(BusMessageType.POP_IS_ADDING, false);
  };

  const getViewComponent = (viewType: MainViewEnum): ReactElement | undefined => {
    switch (viewType) {
      case MainViewEnum.CREATE_LIST:
        return <MainMenuListComponent closeListCallback={changeMainTab} />;
      case MainViewEnum.PAGE_OBJECTS:
        return <ObjViewComponent editNoteCallback={editNoteCallback} />;
      case MainViewEnum.NOTE:
        return (
          <NoteComponent
            currentView={'NOTE_ADD'}
            editNote={editNote}
            addCallback={saveCancelNoteCallback}
            cancelCallback={saveCancelNoteCallback}
          />
        );
      case MainViewEnum.SAVE_PROGRESS:
        return <SavePageProgressComponent closeListCallback={changeMainTab} />;
    }
  };

  const currentComponent = getViewComponent(currentView);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <MainHeaderComponent
          currentView={currentView}
          previousView={previousView}
          changeMainTabCallback={changeMainTab}
        />
        <div style={{ wordBreak: 'break-word', overflow: 'hidden', marginBottom: 110 }}>{currentComponent}</div>
      </div>
      <MainFooterButton openBugReport={() => setCurrentView(MainViewEnum.BUG_REPORT)} />
    </div>
  );
};
