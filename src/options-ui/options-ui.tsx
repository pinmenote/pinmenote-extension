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
import { BoardComponent } from './components/board/board.component';
import { HtmlPreviewComponent } from './components/html-preview/html-preview.component';
import { LeftSideMenu } from './components/menu/left-side.menu';
import { OptionsMessageHandler } from './options-message.handler';
import { SettingsComponent } from './components/settings/settings.component';
import { createRoot } from 'react-dom/client';
import { fnConsoleError } from '../common/fn/console.fn';

const App: FunctionComponent = () => {
  const [showSettings, setShowSettings] = useState<boolean>(window.location.hash === '#settings');

  useEffect(() => {
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

  const mainComponent = showSettings ? <SettingsComponent /> : <BoardComponent />;
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LeftSideMenu />
        <div style={{ width: '100%' }}>{mainComponent}</div>
      </div>
      <HtmlPreviewComponent />
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
