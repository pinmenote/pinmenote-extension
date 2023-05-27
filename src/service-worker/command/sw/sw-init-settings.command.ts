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
import { SettingsConfig, environmentConfig } from '../../../common/environment';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { CryptoGenerateKeyPairCommand } from '../../../common/command/crypto/crypto-generate-key-pair.command';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class SwInitSettingsCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const settings = await BrowserStorageWrapper.get<SettingsConfig>(ObjectStoreKeys.CONTENT_SETTINGS_KEY);
    if (!settings) {
      fnConsoleLog('Settings Initialize');
      await BrowserStorageWrapper.set<SettingsConfig>(ObjectStoreKeys.CONTENT_SETTINGS_KEY, environmentConfig.settings);
      await new CryptoGenerateKeyPairCommand().execute();
    } else if (settings.version !== environmentConfig.settings.version) {
      fnConsoleLog('Settings Migrate placeholder');
    } else {
      fnConsoleLog('Settings Exists', settings);
    }
  }
}
