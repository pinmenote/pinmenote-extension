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
import { ApiStore } from '../../../service-worker/store/api.store';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import AccessTokenDto = Pinmenote.Auth.AccessTokenDto;
import ICommand = Pinmenote.Common.ICommand;

export class RuntimeLoginRefreshCommand implements ICommand<Promise<void>> {
  private readonly ACCESS_TOKEN_EVENT = 'pinmenote.access.token';

  async execute(): Promise<void> {
    fnConsoleLog('handleContentLoginRefresh');
    if (environmentConfig.isProduction) {
      const origin = window.location.origin;
      const key = `${ApiStore.ACCESS_TOKEN}:${origin}`;
      const data = await BrowserStorageWrapper.get<AccessTokenDto | undefined>(key);
      window.dispatchEvent(new MessageEvent(this.ACCESS_TOKEN_EVENT, { data }));
    } else {
      const key = `${ApiStore.ACCESS_TOKEN}:${environmentConfig.apiUrl}`;
      const data = await BrowserStorageWrapper.get<AccessTokenDto | undefined>(key);
      window.dispatchEvent(new MessageEvent(this.ACCESS_TOKEN_EVENT, { data }));
    }
  }
}
