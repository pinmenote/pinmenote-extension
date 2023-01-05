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
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { ContentSettingsData } from '../../../../common/model/settings.model';
import { SettingsKeys } from '../../../../common/keys/settings.keys';
import { SettingsStore } from '../../store/settings.store';
import Typography from '@mui/material/Typography';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const ScreenshotSettingsComponent: FunctionComponent<{ format: string; quality: number }> = ({
  format,
  quality
}) => {
  const [screenshotFormat, setScreenshotFormat] = useState<string>(format);
  const [screenshotQuality, setScreenshotQuality] = useState<number>(quality);

  useEffect(() => {
    if (quality !== screenshotQuality) {
      setScreenshotQuality(quality);
    }
    if (format !== screenshotFormat) {
      setScreenshotFormat(format);
    }
  });

  const handleScreenshotQuality = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!SettingsStore.settings) return;
    const value = Math.max(0, Math.min(parseInt(e.target.value), 100));
    SettingsStore.settings.screenshotQuality = value;
    await BrowserStorageWrapper.set<ContentSettingsData>(SettingsKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
    setScreenshotQuality(value);
  };

  const handleScreenshotFormat = async (e: SelectChangeEvent): Promise<void> => {
    if (!SettingsStore.settings) return;
    SettingsStore.settings.screenshotFormat = e.target.value;
    await BrowserStorageWrapper.set<ContentSettingsData>(SettingsKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
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
