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
import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { BusMessageType } from '../../../common/model/bus.model';
import ClearIcon from '@mui/icons-material/Clear';
import { ContentSettingsComponent } from './content/content-settings.component';
import { ContentSettingsData } from '../../../common/model/settings.model';
import { CryptoSettingsCommand } from './crypto/crypto-settings.command';
import { IconButton } from '@mui/material';
import { ScreenshotSettingsComponent } from './screenshot/screenshot-settings.component';
import { ServerSettingsComponent } from './server/server-settings.component';
import { SettingsStore } from '../store/settings.store';
import { SyncSettingsComponent } from './sync/sync-settings.component';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

const containerStyle: CSSProperties = {
  margin: 10,
  width: '70vw',
  borderRadius: 5,
  border: '2px dashed #000',
  padding: 20
};

export const SettingsComponent: FunctionComponent = () => {
  const [settings, setSettings] = useState<ContentSettingsData | undefined>(SettingsStore.settings);
  useEffect(() => {
    const settingsKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.OPT_GET_SETTINGS_DATA, async () => {
      await SettingsStore.fetchData();
      setSettings(SettingsStore.settings);
    });
    SettingsStore.dispatchInit();
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_GET_SETTINGS_DATA, settingsKey);
    };
  });

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
          <ScreenshotSettingsComponent
            format={settings?.screenshotFormat || ''}
            quality={settings?.screenshotQuality || 0}
          ></ScreenshotSettingsComponent>
        </div>
        <div style={containerStyle}>
          <ContentSettingsComponent
            radius={settings?.borderRadius || ''}
            style={settings?.borderStyle || ''}
          ></ContentSettingsComponent>
        </div>
        <div style={containerStyle}>
          <CryptoSettingsCommand></CryptoSettingsCommand>
        </div>
        <div style={containerStyle}>
          <SyncSettingsComponent></SyncSettingsComponent>
        </div>
        <div style={containerStyle}>
          <ServerSettingsComponent></ServerSettingsComponent>
        </div>
      </div>
    </div>
  );
};
