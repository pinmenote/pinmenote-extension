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
import React, { FunctionComponent } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import Button from '@mui/material/Button';
import { MainFooterButton } from './main-footer.button';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import Typography from '@mui/material/Typography';

export const ConnectionErrorComponent: FunctionComponent = () => {
  const isExtension = PopupActiveTabStore.isExtension;
  return <div>{isExtension ? <ExtensionMessage /> : <NoUrlMessage />}</div>;
};

const ExtensionMessage: FunctionComponent = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Typography
        variant="h5"
        component="h5"
        sx={{ backgroundColor: '#d3a52f', color: '#ffffff', padding: 5, textAlign: 'center', width: '100%' }}
      >
        <span>Pinception disabled</span>
      </Typography>
      <MainFooterButton />
    </div>
  );
};

const messageStyle = { fontSize: '12pt', paddingTop: 5, margin: 0 };

const NoUrlMessage: FunctionComponent = () => {
  const handleRefreshPage = async (): Promise<void> => {
    await BrowserApi.tabs.reload();
    window.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ backgroundColor: '#000000', color: '#ffffff', padding: 5, textAlign: 'center', width: '100%' }}>
        <p style={{ fontSize: '12pt', marginTop: 20, marginBottom: 20 }}>communication problem</p>
        <p style={messageStyle}>refresh page to add and view pins</p>
        <p style={{ fontSize: '12pt', marginLeft: 5, marginRight: 5 }}>
          plugin won&apos;t work on browser configuration and specific browser company pages
        </p>
        <p style={{ ...messageStyle, marginBottom: 20 }}>
          To allow access to search page results navigate to{' '}
          {BrowserApi.isChrome ? 'chrome://extensions' : 'about:addons'}
        </p>
      </div>
      <Button sx={{ width: '100%', marginTop: 1 }} variant="outlined" onClick={handleRefreshPage}>
        Refresh page
      </Button>
      <MainFooterButton />
    </div>
  );
};
