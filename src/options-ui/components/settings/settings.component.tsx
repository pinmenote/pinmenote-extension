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
import React, { CSSProperties, FunctionComponent } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { ContentSettingsComponent } from './content/content-settings.component';
import { CryptoSettingsComponent } from './crypto/crypto-settings.component';
import IconButton from '@mui/material/IconButton';
import { ScreenshotSettingsComponent } from './screenshot/screenshot-settings.component';
import { ServerSettingsComponent } from './server/server-settings.component';
import Typography from '@mui/material/Typography';

const containerStyle: CSSProperties = {
  margin: 10,
  width: '70vw',
  borderRadius: 5,
  border: '2px dashed #000',
  padding: 20
};

export const SettingsComponent: FunctionComponent = () => {
  const handleCloseClick = () => {
    window.location.hash = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography fontSize="3em" style={{ margin: 20 }}>
          Settings
        </Typography>
        <IconButton onClick={handleCloseClick}>
          <ClearIcon />
        </IconButton>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', height: '90vh', marginBottom: 50 }}>
        <div style={containerStyle}>
          <ScreenshotSettingsComponent></ScreenshotSettingsComponent>
        </div>
        <div style={containerStyle}>
          <ContentSettingsComponent></ContentSettingsComponent>
        </div>
        <div style={containerStyle}>
          <CryptoSettingsComponent></CryptoSettingsComponent>
        </div>
        <div style={containerStyle}>
          <ServerSettingsComponent></ServerSettingsComponent>
        </div>
      </div>
    </div>
  );
};
