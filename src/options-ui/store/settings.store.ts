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
import { BrowserStorageWrapper } from '../../common/service/browser.storage.wrapper';
import { SettingsConfig } from '../../common/environment';
import { SettingsKeys } from '../../common/keys/settings.keys';

export class SettingsStore {
  static settings?: SettingsConfig;

  static fetchData = async (): Promise<void> => {
    this.settings = await BrowserStorageWrapper.get<SettingsConfig>(SettingsKeys.CONTENT_SETTINGS_KEY);
  };
}