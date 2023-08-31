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
import { AccessTokenDto, TokenDataDto } from '../../../common/model/shared/token.dto';
import { FetchHeaders, RefreshTokenParams } from '@pinmenote/fetch-service';
import { TokenStorageGetCommand } from '../../../common/command/server/token/token-storage-get.command';
import { TokenStorageSetCommand } from '../../../common/command/server/token/token-storage-set.command';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import jwtDecode from 'jwt-decode';

export class ApiCallBase {
  protected token: AccessTokenDto | undefined;
  protected tokenData: TokenDataDto | undefined;

  get apiUrl(): string {
    return environmentConfig.defaultServer;
  }

  get storeUrl(): string | undefined {
    return this.tokenData?.data.store;
  }

  protected async initTokenData() {
    this.token = await new TokenStorageGetCommand().execute();
    if (!this.token) return;
    this.tokenData = jwtDecode<TokenDataDto>(this.token.access_token);
  }

  protected refreshParams(): RefreshTokenParams {
    return {
      data: {
        refreshKey: 'message',
        refreshValue: 'jwt expired',
        method: 'PUT',
        url: `${this.apiUrl}/api/v1/auth/refresh-token`
      },
      successCallback: (res) => {
        if (res.status === 200) {
          const value: AccessTokenDto = JSON.parse(res.data);
          new TokenStorageSetCommand(value)
            .execute()
            .then(() => {
              /* IGNORE */
            })
            .catch(() => {
              /* IGNORE */
            });
          return {
            Authorization: `Bearer ${value.access_token}`
          } as FetchHeaders;
        }
        fnConsoleLog('refreshParams->successCallback', res);
        return {};
      },
      errorCallback: (error) => {
        fnConsoleLog('refreshParams->errorCallback', error);
      }
    };
  }

  protected getAuthHeaders(): FetchHeaders {
    if (!this.token) return {};
    return {
      Authorization: `Bearer ${this.token.access_token}`
    };
  }
}