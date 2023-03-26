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
import { EncryptDecryptComponent } from '../encrypt-decrypt/encrypt-decrypt.component';
import { MainFooterButton } from './main-footer.button';
import { MainHeaderComponent } from './main-header.component';
import { MainViewEnum } from '../component-model';
import { PinListViewComponent } from '../pins/pin-list-view.component';
import { TaskNoteComponent } from '../task-note/task-note.component';

const getViewComponent = (viewType: MainViewEnum): ReactElement | undefined => {
  switch (viewType) {
    case MainViewEnum.PIN:
      return <PinListViewComponent />;
    case MainViewEnum.ENCRYPT_DECRYPT:
      return <EncryptDecryptComponent />;
    case MainViewEnum.TASK_NOTE:
      return <TaskNoteComponent />;
  }
};

export const MainViewComponent: FunctionComponent = () => {
  const [currentView, setCurrentView] = useState<MainViewEnum>(MainViewEnum.PIN);

  const changeMainTab = (viewType: MainViewEnum) => {
    setCurrentView(viewType);
  };

  const currentComponent = getViewComponent(currentView);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <MainHeaderComponent changeMainTabCallback={changeMainTab} />
        {/* marginBottom:155 if test code is uncommented */}
        <div style={{ wordBreak: 'break-word', overflow: 'auto', marginBottom: 110, marginTop: 10 }}>
          {currentComponent}
        </div>
      </div>
      <MainFooterButton />
    </div>
  );
};
