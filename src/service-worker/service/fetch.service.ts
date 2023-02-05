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
import { ApiStore } from '../store/api.store';
import { environmentConfig } from '../../common/environment';
import { fnConsoleLog } from '../../common/fn/console.fn';
import AccessTokenDto = Pinmenote.Account.AccessTokenDto;

export class ResponseError extends Error {
  constructor(message: string, readonly error: any) {
    super(message);
  }
}

export class FetchService {
  static async post<T>(url: string, data?: any, headers?: { [key: string]: string }): Promise<T> {
    headers = this.applyDefaultHeaders(headers);
    const response = await fetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers
    });
    if (!response.ok) {
      throw new ResponseError(`Error POST ${url}`, await response.json());
    }
    return await response.json();
  }

  static async patch<T>(url: string, data?: any, headers?: { [key: string]: string }): Promise<T> {
    headers = this.applyDefaultHeaders(headers);
    const response = await fetch(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers
    });
    if (!response.ok) {
      fnConsoleLog(headers);
      throw new ResponseError(`Error PATCH ${url}`, await response.json());
    }
    return await response.json();
  }

  static async get<T>(url: string, headers: { [key: string]: string }, json = true): Promise<T> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: ctrl.signal
    });
    if (response.headers.get('x-refresh-token') === 'yes') {
      await this.refreshToken();
    }
    if (!response.ok) {
      const errorData = json ? await response.json() : await response.text();
      throw new ResponseError(`Error GET ${url}`, errorData);
    }
    return json ? await response.json() : await response.text();
  }

  static async refreshToken(): Promise<void> {
    const tokenValue = ApiStore.accessToken;
    if (!tokenValue) return;
    const authHeaders = {
      Authorization: `Bearer ${tokenValue.access_token}`
    };
    const resp = await this.patch<AccessTokenDto>(
      `${environmentConfig.apiUrl}/api/v1/refresh-token`,
      null,
      authHeaders
    );
    await ApiStore.setAccessToken(resp);
  }

  private static applyDefaultHeaders(headers?: { [key: string]: string }): { [key: string]: string } {
    if (!headers) headers = {};
    Object.assign(headers, {
      'Content-Type': 'application/json'
    });
    return headers;
  }
}
