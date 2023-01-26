/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import '../css/prosemirror.css';

import React, { FunctionComponent, useEffect, useState } from 'react';
import { fnConsoleError, fnConsoleLog } from '../common/fn/console.fn';
import { LeftSideMenu } from './view/menu/left-side.menu';
import { OptionsMessageHandler } from './options-message.handler';
import { PinBoard } from './view/pin-board/pin.board';
import { PinBoardStore } from './view/store/pin-board.store';
import { SettingsComponent } from './view/settings/settings.component';
import { createRoot } from 'react-dom/client';

const initPinBoardStore = async () => {
  fnConsoleLog('initPinBoardStore');
  await PinBoardStore.clearSearch();
  await PinBoardStore.sendRange();
};

const App: FunctionComponent = () => {
  const [showSettings, setShowSettings] = useState<boolean>(window.location.hash === '#settings');

  useEffect(() => {
    if (!showSettings) {
      setTimeout(initPinBoardStore, 0);
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });
  const handleHashChange = () => {
    if (window.location.hash === '#settings') {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  };

  const mainComponent = showSettings ? <SettingsComponent /> : <PinBoard />;
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <LeftSideMenu />
      <div style={{ width: '100%' }}>{mainComponent}</div>
    </div>
  );
};

try {
  OptionsMessageHandler.init();
} catch (e: unknown) {
  fnConsoleError('PROBLEM OptionsMessageHandler.init !!!', e);
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
