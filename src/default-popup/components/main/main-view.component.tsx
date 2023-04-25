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
import { CalendarComponent } from '../calendar/calendar.component';
import { DecryptComponent } from '../decrypt/decrypt.component';
import { EncryptComponent } from '../encrypt/encrypt.component';
import { MainFooterButton } from './main-footer.button';
import { MainHeaderComponent } from './main-header.component';
import { MainMenuListComponent } from './main-menu-list.component';
import { MainViewEnum } from '../component-model';
import { NoteComponent } from '../note/note.component';
import { ObjListViewComponent } from '../obj/obj-list-view.component';
import { PopupFunctionsComponent } from '../popup-functions/popup-functions.component';
import { TaskComponent } from '../task/task.component';

const getViewComponent = (
  viewType: MainViewEnum,
  closeListCallback: (viewType: MainViewEnum) => void
): ReactElement | undefined => {
  switch (viewType) {
    case MainViewEnum.CREATE_LIST:
      return <MainMenuListComponent closeListCallback={closeListCallback} />;
    case MainViewEnum.PAGE_OBJECTS:
      return <ObjListViewComponent />;
    case MainViewEnum.ENCRYPT:
      return <EncryptComponent />;
    case MainViewEnum.DECRYPT:
      return <DecryptComponent />;
    case MainViewEnum.CALENDAR:
      return <CalendarComponent />;
    case MainViewEnum.TASK:
      return <TaskComponent />;
    case MainViewEnum.NOTE:
      return <NoteComponent />;
    case MainViewEnum.FUNCTION:
      return <PopupFunctionsComponent />;
  }
};

export const MainViewComponent: FunctionComponent = () => {
  const [previousView, setPreviousView] = useState<MainViewEnum>(MainViewEnum.PAGE_OBJECTS);
  const [currentView, setCurrentView] = useState<MainViewEnum>(MainViewEnum.PAGE_OBJECTS);

  const changeMainTab = (viewType: MainViewEnum) => {
    setPreviousView(currentView);
    setCurrentView(viewType);
  };

  const currentComponent = getViewComponent(currentView, changeMainTab);

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
      <MainFooterButton />
    </div>
  );
};
