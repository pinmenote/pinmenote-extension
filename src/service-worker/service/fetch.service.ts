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
import { AccessTokenDto } from '../../common/model/shared/token.dto';
import { ApiStore } from '../store/api.store';
import { environmentConfig } from '../../common/environment';
import { fnConsoleLog } from '../../common/fn/console.fn';

export enum ResponseType {
  JSON = 1,
  TEXT,
  BLOB
}

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

  static async get(url: string, headers: { [key: string]: string }, type = ResponseType.JSON): Promise<any> {
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
      const errorData = type === ResponseType.JSON ? await response.json() : await response.text();
      throw new ResponseError(`Error GET ${url}`, errorData);
    }
    if (type === ResponseType.BLOB) return await response.blob();
    if (type === ResponseType.JSON) return await response.json();
    return await response.text();
  }

  static async refreshToken(): Promise<void> {
    const tokenValue = ApiStore.accessToken;
    if (!tokenValue) return;
    const authHeaders = {
      Authorization: `Bearer ${tokenValue.access_token}`
    };
    const resp = await this.patch<AccessTokenDto>(
      `${environmentConfig.url.api}/api/v1/refresh-token`,
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
