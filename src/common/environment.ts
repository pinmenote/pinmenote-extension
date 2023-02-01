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

export type ScreenshotFormat = 'jpeg' | 'png';

export interface SettingsConfig {
  version: number;
  screenshotFormat: ScreenshotFormat;
  screenshotQuality: number;
  borderStyle: string;
  borderRadius: string;
  themeColor: string;
  videoDisplayTime: number;
}

interface EnvironmentConfig {
  showAckMessage: boolean;
  apiUrl: string;
  websiteUrl: string;
  shortUrl: string;
  isProduction: boolean;
  settings: SettingsConfig;
  objListLimit: number;
}

export const environmentConfig: EnvironmentConfig = {
  showAckMessage: false,
  apiUrl: process.env.API_URL || 'https://pinmenote.com',
  websiteUrl: process.env.SHORT_URL || 'https://pmn.cl',
  shortUrl: process.env.WEBSITE_URL || 'https://pinmenote.com',
  isProduction: process.env.IS_PRODUCTION === 'true',
  settings: {
    version: parseInt(process.env.VERSION || '1'),
    screenshotFormat: 'jpeg',
    screenshotQuality: 90,
    borderStyle: '2px solid #ff0000',
    borderRadius: '5px',
    themeColor: '#ff0000',
    videoDisplayTime: 5
  },
  objListLimit: parseInt(process.env.OBJ_LIST_LIMIT || '100000')
};
