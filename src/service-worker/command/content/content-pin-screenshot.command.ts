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
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ContentSettingsData } from '../../../common/model/settings.model';
import { SettingsKeys } from '../../../common/keys/settings.keys';
import { fnBrowserApi } from '../../../common/service/browser.api.wrapper';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { sendTabMessage } from '../../../common/message/tab.message';
import ICommand = Pinmenote.Common.ICommand;

export class ContentPinScreenshotCommand implements ICommand<void> {
  async execute(): Promise<void> {
    try {
      const settings = await BrowserStorageWrapper.get<ContentSettingsData>(SettingsKeys.CONTENT_SETTINGS_KEY);
      const data = await fnBrowserApi().tabs.captureVisibleTab({
        format: settings.screenshotFormat,
        quality: settings.screenshotQuality
      });
      await sendTabMessage({ type: BusMessageType.CONTENT_PIN_SCREENSHOT, data });
    } catch (e) {
      fnConsoleLog('Error', e);
    }
  }
}
