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
import { Input, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { CSSProperties, ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { ScreenshotFormat, SettingsConfig } from '../../../../common/environment';
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { SettingsKeys } from '../../../../common/keys/settings.keys';
import { SettingsStore } from '../../store/settings.store';
import Typography from '@mui/material/Typography';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const ScreenshotSettingsComponent: FunctionComponent = () => {
  const [screenshotFormat, setScreenshotFormat] = useState<string>(SettingsStore.settings?.screenshotFormat || 'jpeg');
  const [screenshotQuality, setScreenshotQuality] = useState<number>(SettingsStore.settings?.screenshotQuality || 0);

  useEffect(() => {
    setScreenshotQuality(SettingsStore.settings?.screenshotQuality || 0);
    setScreenshotFormat(SettingsStore.settings?.screenshotFormat || 'jpeg');
  });

  const handleScreenshotQuality = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!SettingsStore.settings) return;
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 100) {
      SettingsStore.settings.screenshotQuality = value;
      await BrowserStorageWrapper.set<SettingsConfig>(SettingsKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
    }
    setScreenshotQuality(value);
  };

  const handleScreenshotFormat = async (e: SelectChangeEvent): Promise<void> => {
    if (!SettingsStore.settings) return;
    SettingsStore.settings.screenshotFormat = e.target.value as ScreenshotFormat;
    await BrowserStorageWrapper.set<SettingsConfig>(SettingsKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
    setScreenshotFormat(e.target.value);
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
        <Select label="format" value={screenshotFormat} onChange={handleScreenshotFormat} style={{ width: 300 }}>
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
