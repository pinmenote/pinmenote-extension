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
import React, { CSSProperties, ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { ScreenshotFormat, SettingsConfig } from '../../../../common/environment';
import { BrowserStorage } from '@pinmenote/browser-api';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import Select from '@mui/material/Select';
import { SelectChangeEvent } from '@mui/material/Select';
import { SettingsStore } from '../../../store/settings.store';
import Typography from '@mui/material/Typography';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const ScreenshotSettingsComponent: FunctionComponent = () => {
  const [screenshotFormat, setScreenshotFormat] = useState<string>('');
  const [screenshotQuality, setScreenshotQuality] = useState<number>(0);

  useEffect(() => {
    setTimeout(async () => {
      await SettingsStore.fetchData();
      setScreenshotQuality(SettingsStore.settings?.screenshotQuality || 0);
      setScreenshotFormat(SettingsStore.settings?.screenshotFormat || 'jpeg');
    }, 0);
  }, []);

  const handleScreenshotQuality = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!SettingsStore.settings) return;
    const value = parseInt(e.target.value);
    setScreenshotQuality(value);
    if (value > 0 && value <= 100) {
      SettingsStore.settings.screenshotQuality = value;
      await BrowserStorage.set<SettingsConfig>(ObjectStoreKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
    }
  };

  const handleScreenshotFormat = async (e: SelectChangeEvent): Promise<void> => {
    if (!SettingsStore.settings) return;
    setScreenshotFormat(e.target.value);
    SettingsStore.settings.screenshotFormat = e.target.value as ScreenshotFormat;
    await BrowserStorage.set<SettingsConfig>(ObjectStoreKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
  };

  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        screenshot
      </Typography>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          format
        </Typography>
        <Select
          size="small"
          label="format"
          value={screenshotFormat}
          onChange={handleScreenshotFormat}
          style={{ width: 300 }}
        >
          <MenuItem value="jpeg">JPEG</MenuItem>
          <MenuItem value="png">PNG</MenuItem>
        </Select>
      </div>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          quality
        </Typography>
        <Input type="number" value={screenshotQuality} onChange={handleScreenshotQuality} style={{ width: 300 }} />
      </div>
    </div>
  );
};
