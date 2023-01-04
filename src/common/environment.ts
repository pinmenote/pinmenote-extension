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

type ScreenshotFormat = 'jpeg' | 'png';

interface SettingsConfig {
  screenshotFormat: ScreenshotFormat;
  screenshotQuality: number;
  borderStyle: string;
  borderRadius: string;
  videoDisplayTime: number;
}

interface EnvironmentConfig {
  showAckMessage: boolean;
  apiUrl: string;
  websiteUrl: string;
  shortUrl: string;
  isProduction: boolean;
  settings: SettingsConfig;
  version: number;
}

export const environmentConfig: EnvironmentConfig = {
  showAckMessage: false,
  apiUrl: 'https://pinmenote.com',
  websiteUrl: 'https://pinmenote.com',
  shortUrl: 'https://pmn.cl',
  isProduction: true,
  settings: {
    screenshotFormat: 'jpeg',
    screenshotQuality: 80,
    borderRadius: '5px',
    borderStyle: '2px solid #ff0000',
    videoDisplayTime: 5
  },
  version: 1
};

if (process.env.NODE_ENV === 'development') {
  environmentConfig.apiUrl = 'http://localhost:3000';
  environmentConfig.websiteUrl = 'http://localhost:4200';
  environmentConfig.shortUrl = 'http://localhost:8001';
  environmentConfig.isProduction = false;
}

export function getWebsiteUrl(uri: string): string {
  return `${environmentConfig.websiteUrl}${uri}`;
}
