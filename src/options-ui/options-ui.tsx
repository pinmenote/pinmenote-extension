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
import '../css/prosemirror.css';

import React, { FunctionComponent, useEffect, useState } from 'react';
import { BoardComponent } from './components/board/board.component';
import { BoardMenu } from './components/menu/board-menu';
import { HtmlPreviewComponent } from './components/html-preview/html-preview.component';
import { MuiThemeFactory } from '../common/components/react/mui-theme.factory';
import { OptionsMessageHandler } from './options-message.handler';
import { SettingsComponent } from './components/settings/settings.component';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { createRoot } from 'react-dom/client';
import { fnConsoleError } from '../common/fn/console.fn';

const theme = MuiThemeFactory.createTheme();

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
      <ThemeProvider theme={theme}>
        <BoardMenu />
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '100%' }}>{mainComponent}</div>
        </div>
        <HtmlPreviewComponent />
      </ThemeProvider>
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
