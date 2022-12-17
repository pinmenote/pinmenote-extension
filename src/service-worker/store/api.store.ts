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
import { environmentConfig } from '@common/environment';
import { fnConsoleLog } from '@common/fn/console.fn';
import jwtDecode from 'jwt-decode';
import AccessTokenDto = Pinmenote.Auth.AccessTokenDto;
import TokenDataDto = Pinmenote.Auth.TokenDataDto;

export class ApiStore {
  static readonly KEY_NOTE_UPDATE = 'noteSyncUpdate';
  static readonly ACCESS_TOKEN = 'accessToken';

  private static accessTokenDto?: AccessTokenDto;
  private static tokenDataDto?: TokenDataDto;

  static async getUsername(): Promise<string> {
    const tokenData = await this.getTokenData();
    if (!tokenData) throw new Error('Missing tokenData');
    return tokenData.data.username;
  }

  static get accessToken(): AccessTokenDto | undefined {
    return this.accessTokenDto;
  }

  static async getTokenData(): Promise<TokenDataDto | undefined> {
    await this.refreshTokenFromStorage();
    return this.tokenDataDto;
  }

  static async setAccessToken(value: AccessTokenDto): Promise<void> {
    this.accessTokenDto = value;
    await BrowserStorageWrapper.set(ApiStore.getAccessTokenKey(), value);
    this.tokenDataDto = jwtDecode(value.access_token);
  }

  static async clearToken(): Promise<void> {
    fnConsoleLog('WorkerApiManager->clearToken');
    await BrowserStorageWrapper.remove(this.getAccessTokenKey());
    this.accessTokenDto = undefined;
    this.tokenDataDto = undefined;
  }

  private static async refreshTokenFromStorage(): Promise<void> {
    if (!this.tokenDataDto) {
      this.accessTokenDto = await BrowserStorageWrapper.get<AccessTokenDto | undefined>(this.getAccessTokenKey());
      if (this.accessTokenDto?.access_token) {
        this.tokenDataDto = jwtDecode(this.accessTokenDto.access_token);
      }
    }
  }

  private static getAccessTokenKey(): string {
    return `${this.ACCESS_TOKEN}:${environmentConfig.apiUrl}`;
  }

  static async getAuthHeaders(): Promise<{ [key: string]: string }> {
    await this.refreshTokenFromStorage();
    if (!this.accessTokenDto) throw new Error('Empty token');
    return {
      Authorization: `Bearer ${this.accessTokenDto.access_token}`
    };
  }
}
