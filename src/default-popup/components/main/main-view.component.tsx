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
import React, { FunctionComponent, ReactElement, useState } from 'react';
import { BugReportComponent } from '../bug-report/bug-report.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { DecryptComponent } from '../decrypt/decrypt.component';
import { EncryptComponent } from '../encrypt/encrypt.component';
import { MainFooterButton } from './main-footer.button';
import { MainHeaderComponent } from './main-header.component';
import { MainMenuListComponent } from './main-menu-list.component';
import { MainViewEnum } from '../component-model';
import { NoteComponent } from '../note/note.component';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPageNoteDto } from '../../../common/model/obj/obj-note.dto';
import { ObjViewComponent } from '../obj/obj-view.component';
import { PopupFunctionsComponent } from '../popup-functions/popup-functions.component';
import { TaskComponent } from '../task/task.component';

export const MainViewComponent: FunctionComponent = () => {
  const [previousView, setPreviousView] = useState<MainViewEnum>(MainViewEnum.PAGE_OBJECTS);
  const [currentView, setCurrentView] = useState<MainViewEnum>(MainViewEnum.PAGE_OBJECTS);
  const [editNote, setEditNote] = useState<ObjDto<ObjPageNoteDto> | undefined>();

  const changeMainTab = (viewType: MainViewEnum) => {
    setPreviousView(currentView);
    setCurrentView(viewType);
  };

  const editNoteCallback = (obj: ObjDto<ObjPageNoteDto>) => {
    setEditNote(obj);
    setCurrentView(MainViewEnum.NOTE);
  };

  const getViewComponent = (viewType: MainViewEnum): ReactElement | undefined => {
    switch (viewType) {
      case MainViewEnum.CREATE_LIST:
        return <MainMenuListComponent closeListCallback={changeMainTab} />;
      case MainViewEnum.PAGE_OBJECTS:
        return <ObjViewComponent editNoteCallback={editNoteCallback} />;
      case MainViewEnum.ENCRYPT:
        return <EncryptComponent />;
      case MainViewEnum.DECRYPT:
        return <DecryptComponent />;
      case MainViewEnum.CALENDAR:
        return <CalendarComponent />;
      case MainViewEnum.TASK:
        return <TaskComponent />;
      case MainViewEnum.BUG_REPORT:
        return <BugReportComponent cancelCallback={() => setCurrentView(MainViewEnum.PAGE_OBJECTS)} />;
      case MainViewEnum.NOTE:
        return (
          <NoteComponent
            currentView={'NOTE_ADD'}
            editNote={editNote}
            addCallback={() => setCurrentView(MainViewEnum.PAGE_OBJECTS)}
            cancelCallback={() => setCurrentView(MainViewEnum.PAGE_OBJECTS)}
          />
        );
      case MainViewEnum.FUNCTION:
        return <PopupFunctionsComponent />;
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
        <div style={{ wordBreak: 'break-word', overflow: 'auto', marginBottom: 110 }}>{currentComponent}</div>
      </div>
      <MainFooterButton openBugReport={() => setCurrentView(MainViewEnum.BUG_REPORT)} />
    </div>
  );
};
