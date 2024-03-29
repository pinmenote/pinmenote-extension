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

export type ScreenshotFormat = 'jpeg' | 'png';

export interface SettingsHistoryConfig {
  pinComment: boolean;
  pinDraw: boolean;
  pageComment: boolean;
  pageNote: boolean;
}

export interface SettingsConfig {
  version: number;
  screenshotFormat: ScreenshotFormat;
  screenshotQuality: number;
  borderStyle: string;
  newElementStyle: string;
  borderRadius: string;
  themeColor: string;
  skipCssImageSizeMB: number;
  expertMode: boolean;
  history: SettingsHistoryConfig;
  interface?: SettingsInterfaceConfig;
}

interface SettingsInterfaceConfig {
  optionsDrawerOpen?: boolean;
}

interface FeatureFlag {
  SYNC_ENABLED: boolean;
  LOGIN_ENABLED: boolean;
  NEW_PIN_PREVIEW: boolean;
  REPORT_BUG: boolean;
}

interface EnvironmentConfig {
  defaultServer: string;
  isProduction: boolean;
  featureFlag: FeatureFlag;
  settings: SettingsConfig;
  objListLimit: number;
}

export const environmentConfig: EnvironmentConfig = {
  defaultServer: process.env.WEB_URL || 'https://pinmenote.com',
  isProduction: process.env.IS_PRODUCTION === '1',
  featureFlag: {
    SYNC_ENABLED: process.env.FF_SYNC_ENABLED === '1',
    LOGIN_ENABLED: process.env.FF_LOGIN_ENABLED === '1',
    NEW_PIN_PREVIEW: process.env.FF_NEW_PIN_PREVIEW === '1',
    REPORT_BUG: process.env.FF_REPORT_BUG === '1'
  },
  settings: {
    version: parseInt(process.env.VERSION || '1'),
    screenshotFormat: 'png',
    screenshotQuality: 90,
    borderStyle: 'none',
    newElementStyle: '2px solid #ff0000',
    borderRadius: '5px',
    themeColor: '#ff0000',
    skipCssImageSizeMB: 2,
    expertMode: false,
    history: {
      pinComment: false,
      pinDraw: false,
      pageComment: false,
      pageNote: false
    }
  },
  objListLimit: parseInt(process.env.OBJ_LIST_LIMIT || '100')
};
