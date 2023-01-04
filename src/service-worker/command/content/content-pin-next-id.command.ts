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
import { BrowserStorageWrapper } from '@common/service/browser.storage.wrapper';
import { BusMessageType } from '@common/model/bus.model';
import { ObjectStoreKeys } from '../../store/keys/object.store.keys';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendTabMessage } from '@common/message/tab.message';
import ICommand = Pinmenote.Common.ICommand;

export class ContentPinNextIdCommand implements ICommand<void> {
  async execute(): Promise<void> {
    try {
      const nextId = (await this.getCount()) + 1;
      await sendTabMessage<number>({
        type: BusMessageType.CONTENT_PIN_ID,
        data: nextId
      });
    } catch (e) {
      fnConsoleLog('Error', e);
    }
  }

  async getCount(): Promise<number> {
    const value = await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_LAST_ID);
    return value || 0;
  }
}
