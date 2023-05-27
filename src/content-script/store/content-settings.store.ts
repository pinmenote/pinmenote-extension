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
import { BrowserStorageWrapper } from '../../common/service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../common/keys/object.store.keys';
import { SettingsConfig } from '../../common/environment';

export class ContentSettingsStore {
  private static settingsData: SettingsConfig;

  static get settings(): SettingsConfig {
    return this.settingsData;
  }

  static get newElementStyle(): string {
    return this.settingsData.newElementStyle;
  }

  static get borderRadius(): string {
    return this.settingsData.borderRadius;
  }

  static get screenshotQuality(): number {
    return this.settingsData.screenshotQuality;
  }

  static get screenshotFormat(): string {
    return this.settingsData.screenshotFormat;
  }

  static get skipCssImageSize(): number {
    return this.settingsData.skipCssImageSizeMB;
  }

  static initSettings = async (): Promise<void> => {
    this.settingsData = await BrowserStorageWrapper.get<SettingsConfig>(ObjectStoreKeys.CONTENT_SETTINGS_KEY);
  };
}
