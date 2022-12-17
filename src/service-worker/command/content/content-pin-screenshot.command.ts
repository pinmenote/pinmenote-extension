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
import { BusMessageType } from '@common/model/bus.model';
import { fnBrowserApi } from '@common/service/browser.api.wrapper';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendTabMessage } from '@common/message/tab.message';
import ICommand = Pinmenote.Common.ICommand;

export class ContentPinScreenshotCommand implements ICommand<void> {
  async execute(): Promise<void> {
    try {
      // TODO allow to change inside settings
      const data = await fnBrowserApi().tabs.captureVisibleTab({
        format: 'jpeg',
        quality: 80
      });
      await sendTabMessage({ type: BusMessageType.CONTENT_PIN_SCREENSHOT, data });
    } catch (e) {
      fnConsoleLog('Error', e);
    }
  }
}
