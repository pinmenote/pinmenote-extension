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
import { ApiStore } from '../../store/api.store';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import AccessTokenDto = Pinmenote.Auth.AccessTokenDto;
import ICommand = Pinmenote.Common.ICommand;

export class ContentLoginCommand implements ICommand<void> {
  constructor(private data: string) {}

  async execute(): Promise<void> {
    try {
      if (environmentConfig.isProduction) {
        const key = `${ApiStore.ACCESS_TOKEN}:${this.data}`;
        const accessToken = await BrowserStorageWrapper.get<AccessTokenDto | undefined>(key);
        await BrowserApi.sendTabMessage<AccessTokenDto | undefined>({
          type: BusMessageType.CONTENT_LOGIN,
          data: accessToken
        });
      } else {
        const key = `${ApiStore.ACCESS_TOKEN}:${environmentConfig.apiUrl}`;
        const accessToken = await BrowserStorageWrapper.get<AccessTokenDto | undefined>(key);
        await BrowserApi.sendTabMessage<AccessTokenDto | undefined>({
          type: BusMessageType.CONTENT_LOGIN,
          data: accessToken
        });
      }
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }
}
