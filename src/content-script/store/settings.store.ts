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
import { ContentSettingsData } from '../../common/model/settings.model';
import { SettingsKeys } from '../../common/keys/settings.keys';
import { environmentConfig } from '../../common/environment';

export class SettingsStore {
  private static borderStyleValue = environmentConfig.settings.borderStyle;
  private static borderRadiusValue = environmentConfig.settings.borderRadius;

  static get borderStyle(): string {
    return this.borderStyleValue;
  }

  static get borderRadius(): string {
    return this.borderRadiusValue;
  }

  static initSettings = async (): Promise<void> => {
    const data = await BrowserStorageWrapper.get<ContentSettingsData>(SettingsKeys.CONTENT_SETTINGS_KEY);
    this.borderRadiusValue = data.borderRadius;
    this.borderStyleValue = data.borderStyle;
  };
}
