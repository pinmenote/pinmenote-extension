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
import React, { CSSProperties, ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { ContentSettingsData } from '../../../../common/model/settings.model';
import { Input } from '@mui/material';
import { SettingsKeys } from '../../../../common/keys/settings.keys';
import { SettingsStore } from '../../store/settings.store';
import Typography from '@mui/material/Typography';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const ContentSettingsComponent: FunctionComponent<{ radius: string; style: string }> = ({ radius, style }) => {
  const [borderRadius, setBorderRadius] = useState<string>(radius);
  const [borderStyle, setBorderStyle] = useState<string>(style);

  useEffect(() => {
    if (radius !== borderRadius) {
      setBorderRadius(radius);
    }
    if (style !== borderStyle) {
      setBorderStyle(style);
    }
  });

  const handleBorderRadiusChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!SettingsStore.settings) return;
    SettingsStore.settings.borderRadius = e.target.value;
    await BrowserStorageWrapper.set<ContentSettingsData>(SettingsKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
    setBorderRadius(e.target.value);
  };

  const handleBorderStyleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!SettingsStore.settings) return;
    SettingsStore.settings.borderStyle = e.target.value;
    await BrowserStorageWrapper.set<ContentSettingsData>(SettingsKeys.CONTENT_SETTINGS_KEY, SettingsStore.settings);
    setBorderStyle(e.target.value);
  };

  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        content
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
    </div>
  );
};
