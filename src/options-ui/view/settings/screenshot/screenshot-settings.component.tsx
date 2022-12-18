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
import { BusMessageType } from '@common/model/bus.model';
import { ContentSettingsData } from '@common/model/settings.model';
import { SettingsStore } from '../../store/settings.store';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { sendRuntimeMessage } from '@common/message/runtime.message';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const ScreenshotSettingsComponent: FunctionComponent = () => {
  const [screenshotFormat, setScreenshotFormat] = useState<string>(SettingsStore.settings?.screenshotFormat || 'jpeg');
  const [screenshotQuality, setScreenshotQuality] = useState<number>(SettingsStore.settings?.screenshotQuality || 80);

  useEffect(() => {
    const settingsKey = TinyEventDispatcher.addListener<ContentSettingsData>(
      BusMessageType.OPTIONS_GET_SETTINGS,
      (event, key, value) => {
        SettingsStore.settings = value;
        setScreenshotFormat(value.screenshotFormat);
        setScreenshotQuality(value.screenshotQuality);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_GET_SETTINGS, settingsKey);
    };
  });

  const handleScreenshotQuality = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const value = Math.max(0, Math.min(parseInt(e.target.value), 100));
    if (SettingsStore.settings) {
      SettingsStore.settings.screenshotQuality = value;
    }
    setScreenshotQuality(value);
    await sendRuntimeMessage({ type: BusMessageType.OPTIONS_SET_SETTINGS, data: SettingsStore.settings });
  };

  const handleScreenshotFormat = async (e: SelectChangeEvent): Promise<void> => {
    if (SettingsStore.settings) {
      SettingsStore.settings.screenshotFormat = e.target.value;
    }
    setScreenshotFormat(e.target.value);
    await sendRuntimeMessage({ type: BusMessageType.OPTIONS_SET_SETTINGS, data: SettingsStore.settings });
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
