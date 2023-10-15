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
import { DEFAULT_BORDER_RADIUS } from '../../../../common/components/colors';
import Input from '@mui/material/Input';
import { SettingsStore } from '../../../store/settings.store';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const ContentSettingsComponent: FunctionComponent = () => {
  const [borderRadius, setBorderRadius] = useState<string>('');
  const [borderStyle, setBorderStyle] = useState<string>('');
  const [expertMode, setExpertMode] = useState<boolean>(false);

  useEffect(() => {
    setSettings();
  }, []);

  const setSettings = () => {
    if (!SettingsStore.settings) {
      setTimeout(setSettings, 100);
      return;
    }
    setBorderRadius(SettingsStore.settings.borderRadius || `${DEFAULT_BORDER_RADIUS}px`);
    setBorderStyle(SettingsStore.settings.borderStyle || '2px solid #ff0000');
    setExpertMode(SettingsStore.settings.expertMode || false);
  };

  const handleBorderRadiusChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!SettingsStore.settings) return;
    setBorderRadius(e.target.value);
    SettingsStore.settings.borderRadius = e.target.value;
    await SettingsStore.saveSettings();
  };

  const handleBorderStyleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!SettingsStore.settings) return;
    setBorderStyle(e.target.value);
    SettingsStore.settings.borderStyle = e.target.value;
    await SettingsStore.saveSettings();
  };

  const handleExpertModeChange = async () => {
    if (!SettingsStore.settings) return;
    setExpertMode(!expertMode);
    SettingsStore.settings.expertMode = !expertMode;
    await SettingsStore.saveSettings();
  };

  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        content
      </Typography>
      <Typography fontSize="2em" style={{ marginBottom: 10 }}>
        pin appearance
      </Typography>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          border radius
        </Typography>
        <Input type="text" value={borderRadius} onChange={handleBorderRadiusChange} style={{ width: 300 }} />
      </div>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          border style
        </Typography>
        <Input type="text" value={borderStyle} onChange={handleBorderStyleChange} style={{ width: 300 }} />
      </div>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          expert mode
        </Typography>
        <Checkbox checked={expertMode} onChange={handleExpertModeChange} />
        <Typography fontSize="0.8em">
          display hidden ui parts and use experimental logic (might break website saving)
        </Typography>
      </div>
    </div>
  );
};
