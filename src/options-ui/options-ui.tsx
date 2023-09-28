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
import { fnConsoleError, fnConsoleLog } from '../common/fn/fn-console';
import { BoardComponent } from './components/board/board.component';
import { BoardDrawer } from './components/board/board/board-drawer';
import { BoardMenu } from './components/board/board/board-menu';
import { HtmlPreviewComponent } from './components/preview/html-preview.component';
import { MuiThemeFactory } from '../common/components/react/mui-theme.factory';
import { ObjGetCommand } from '../common/command/obj/obj-get.command';
import { ObjPageDto } from '../common/model/obj/obj-page.dto';
import { ObjTypeDto } from '../common/model/obj/obj.dto';
import { OptionsMessageHandler } from './options-message.handler';
import { PdfPreviewComponent } from './components/preview/pdf-preview.component';
import { SettingsComponent } from './components/settings/settings.component';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { createRoot } from 'react-dom/client';
import { SettingsStore } from './store/settings.store';

const theme = MuiThemeFactory.createTheme();

enum CurrentView {
  SETTINGS,
  BOARD,
  OBJ_DETAILS,
  PDF_DETAILS
}

const getView = () => {
  const hash = window.location.hash.substring(1);
  if (hash === 'settings') return CurrentView.SETTINGS;
  if (hash.startsWith('obj')) return CurrentView.OBJ_DETAILS;
  if (hash.startsWith('pdf')) return CurrentView.PDF_DETAILS;
  return CurrentView.BOARD;
};

const OptionsUI: FunctionComponent = () => {
  const [currentView, setCurrentView] = useState<CurrentView>(getView());
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  useEffect(() => {
    if (currentView === CurrentView.OBJ_DETAILS) setShowPreview(true);
    if (currentView === CurrentView.PDF_DETAILS) setShowPdfPreview(true);
    setTimeout(() => {
      if (!SettingsStore.settings?.interface) return;
      setShowDrawer(!!SettingsStore.settings.interface.optionsDrawerOpen);
    }, 1);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleHashChange = async () => {
    const view = getView();
    setCurrentView(view);
    if (view === CurrentView.OBJ_DETAILS) {
      await renderDetails();
    } else if (view === CurrentView.PDF_DETAILS) {
      setShowPreview(false);
      setShowPdfPreview(true);
    } else {
      setShowPreview(false);
      setShowPdfPreview(false);
    }
  };

  const renderDetails = async () => {
    try {
      const idhash = window.location.hash.split('/')[1];
      const id = parseInt(idhash);
      // TODO optimize - don't get it twice once here, second inside object
      const obj = await new ObjGetCommand<ObjPageDto>(id).execute();
      if ([ObjTypeDto.PageElementPin, ObjTypeDto.PageElementSnapshot, ObjTypeDto.PageSnapshot].includes(obj.type)) {
        setShowPreview(true);
        setShowPdfPreview(false);
      } else {
        alert('NOT Implemented !!!!');
        window.location.hash = '';
      }
    } catch (e) {
      fnConsoleLog('handleHashChange->error', e);
      window.location.hash = '';
    }
  };

  const handleDrawer = async () => {
    setShowDrawer(!showDrawer);
    await SettingsStore.saveDrawerOpen(!showDrawer);
    fnConsoleLog('App->handleDrawer', !showDrawer);
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <BoardMenu drawerHandler={handleDrawer} />
        <BoardDrawer showDrawer={showDrawer} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginTop: 65,
            width: showDrawer ? 'calc(100% - 200px)' : '100%',
            marginLeft: showDrawer ? 200 : 0
          }}
        >
          <BoardComponent />
        </div>
        <div
          style={{
            display: currentView === CurrentView.SETTINGS ? 'inline-block' : 'none',
            position: 'absolute',
            top: 65,
            left: 0,
            width: showDrawer ? 'calc(100% - 50px)' : '100%',
            height: '100vh',
            backgroundColor: '#ffffff'
          }}
        >
          <SettingsComponent />
        </div>
        <HtmlPreviewComponent visible={showPreview} />
        <PdfPreviewComponent visible={showPdfPreview} />
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
root.render(<OptionsUI />);
