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
import { FetchService, RefreshTokenParams, FetchHeaders } from '@pinmenote/fetch-service';
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { AccessTokenDto } from '../../../common/model/shared/token.dto';
import { TokenStorageSetCommand } from '../../../common/command/server/token/token-storage-set.command';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { ApiAuthUrlCommand } from '../api/api-auth-url.command';
import { TokenStorageGetCommand } from '../../../common/command/server/token/token-storage-get.command';
import { TokenDecodeCommand } from '../../../common/command/server/token/token-decode.command';

export class ContentExtensionLoginCommand implements ICommand<Promise<void>> {
  constructor(private token: AccessTokenDto) {}
  async execute(): Promise<void> {
    if (await this.hasToken()) return;
    fnConsoleLog('ContentExtensionLoginCommand->execute');
    await new ApiAuthUrlCommand().execute();
    const baseUrl = await new ApiAuthUrlCommand().execute();
    const req = await FetchService.fetch<AccessTokenDto | ServerErrorDto>(
      `${baseUrl}/api/v1/login/new-device`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.token.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source: 'EXTENSION' })
      },
      this.refreshParams(baseUrl)
    );
    if (req.ok && 'access_token' in req.data) {
      await new TokenStorageSetCommand(req.data).execute();
    }
  }

  private async hasToken(): Promise<boolean> {
    const extensionToken = await new TokenStorageGetCommand().execute();
    if (!extensionToken) return false;
    const extensionData = new TokenDecodeCommand(extensionToken?.access_token).execute();
    const websiteData = new TokenDecodeCommand(this.token.access_token).execute();
    if (extensionData.sub === websiteData.sub) return true;
    return false;
  }

  protected refreshParams(baseUrl: string): RefreshTokenParams {
    return {
      data: {
        refreshKey: 'message',
        refreshValue: 'jwt expired',
        method: 'PUT',
        url: `${baseUrl}/api/v1/refresh-token`
      },
      successCallback: (res, headers) => {
        const value: AccessTokenDto = JSON.parse(res.data);
        fnConsoleLog('ContentExtensionLoginCommand->successCallback', res, 'value', value, 'headers', headers);
        return {
          ...headers,
          Authorization: `Bearer ${value.access_token}`
        } as FetchHeaders;
      },
      errorCallback: (error) => {
        fnConsoleLog('ContentExtensionLoginCommand->errorCallback', error);
      }
    };
  }
}
