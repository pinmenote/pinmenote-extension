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
import { BusMessageType } from '../../../../common/model/bus.model';
import { ContentSettingsData } from '../../../../common/model/settings.model';
import { Input } from '@mui/material';
import { SettingsStore } from '../../store/settings.store';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { sendRuntimeMessage } from '../../../../common/message/runtime.message';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

const initSettingsStore = () => {
  SettingsStore.getSettings()
    .then(() => {
      /* Empty */
    })
    .catch(() => {
      /* Empty */
    });
};

export const ContentSettingsComponent: FunctionComponent = () => {
  const [borderRadius, setBorderRadius] = useState<string>(SettingsStore.settings?.borderRadius || '');
  const [borderStyle, setBorderStyle] = useState<string>(SettingsStore.settings?.borderStyle || '');

  useEffect(() => {
    if (!borderRadius) {
      initSettingsStore();
    }

    const settingsKey = TinyEventDispatcher.addListener<ContentSettingsData>(
      BusMessageType.OPTIONS_GET_SETTINGS,
      (event, key, value) => {
        SettingsStore.settings = value;
        setBorderRadius(value.borderRadius);
        setBorderStyle(value.borderStyle);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_GET_SETTINGS, settingsKey);
    };
  });

  const handleBorderRadiusChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (SettingsStore.settings) {
      SettingsStore.settings.borderRadius = e.target.value;
    }
    setBorderRadius(e.target.value);
    await sendRuntimeMessage({ type: BusMessageType.OPTIONS_SET_SETTINGS, data: SettingsStore.settings });
  };

  const handleBorderStyleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (SettingsStore.settings) {
      SettingsStore.settings.borderStyle = e.target.value;
    }
    setBorderStyle(e.target.value);
    await sendRuntimeMessage({ type: BusMessageType.OPTIONS_SET_SETTINGS, data: SettingsStore.settings });
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
