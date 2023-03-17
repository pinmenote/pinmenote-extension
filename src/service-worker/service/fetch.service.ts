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
import { FetchResponse, ResponseType } from '../../common/model/api.model';
import { ApiHelper } from '../api/api-helper';
import { TokenStorageRemoveCommand } from '../../common/command/server/token/token-storage-remove.command';
import { TokenStorageSetCommand } from '../../common/command/server/token/token-storage-set.command';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class FetchService {
  static async post<T>(url: string, data?: any, authenticate = false): Promise<FetchResponse<T>> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);

    const requestInit = { method: 'POST', body: data ? JSON.stringify(data) : undefined };

    if (authenticate) {
      const headers = this.applyDefaultHeaders(await ApiHelper.getAuthHeaders());
      return await this.refetch(url, { ...requestInit, headers });
    }
    const req = await fetch(url, { ...requestInit, headers: this.applyDefaultHeaders() });
    return { type: ResponseType.JSON, status: req.status, res: await req.json() };
  }

  static async patch<T>(url: string, data?: any, authenticate = false): Promise<FetchResponse<T>> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);

    const requestInit = { method: 'PATCH', body: data ? JSON.stringify(data) : undefined };

    if (authenticate) {
      const headers = this.applyDefaultHeaders(await ApiHelper.getAuthHeaders());
      return await this.refetch(url, { ...requestInit, headers });
    }
    const req = await fetch(url, { ...requestInit, headers: this.applyDefaultHeaders() });
    return { type: ResponseType.JSON, status: req.status, res: await req.json() };
  }

  static async delete<T>(url: string, authenticate = false): Promise<FetchResponse<T>> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);

    const requestInit = { method: 'DELETE' };

    if (authenticate) {
      const headers = await ApiHelper.getAuthHeaders();
      return await this.refetch(url, { ...requestInit, headers });
    }
    const req = await fetch(url, { ...requestInit, headers: this.applyDefaultHeaders() });
    return { type: ResponseType.JSON, status: req.status, res: await req.json() };
  }

  static async get<T>(url: string, type = ResponseType.JSON, authenticate = false): Promise<FetchResponse<T>> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);

    const requestInit = { method: 'GET', signal: ctrl.signal };

    if (authenticate) {
      const headers = await ApiHelper.getAuthHeaders();
      return await this.refetch<T>(url, { ...requestInit, headers });
    }
    const req = await fetch(url, requestInit);

    let res;
    if (type === ResponseType.BLOB) {
      res = await req.blob();
    } else if (type === ResponseType.JSON) {
      res = await req.json();
    } else {
      res = req.text();
    }
    return {
      type,
      status: req.status,
      res
    };
  }

  private static async refreshToken(): Promise<void> {
    try {
      const req = await fetch(`${ApiHelper.apiUrl}/api/v1/refresh-token`, {
        method: 'POST',
        headers: await ApiHelper.getAuthHeaders()
      });
      const res = await req.json();
      await new TokenStorageSetCommand(res).execute();
    } catch (e) {
      fnConsoleLog('ERROR REFRESH TOKEN', e);
      await new TokenStorageRemoveCommand().execute();
    }
  }

  private static refetch = async <T>(
    input: RequestInfo | URL,
    init: RequestInit,
    type = ResponseType.JSON
  ): Promise<FetchResponse<T>> => {
    let req = await fetch(input, init);
    const res = await req.json();

    if (req.status === 401 && type === ResponseType.JSON && res.message === 'jwt expired') {
      await this.refreshToken();
      const authHeaders = await ApiHelper.getAuthHeaders();
      if (init?.headers) init.headers = { ...init?.headers, ...authHeaders };

      req = await fetch(input, init);
      //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    } else if (res.headers.get('x-refresh-token') === 'yes') {
      // Forced by server
      await this.refreshToken();
    }
    return {
      type,
      status: req.status,
      res
    };
  };

  private static applyDefaultHeaders(headers?: { [key: string]: string }): { [key: string]: string } {
    if (!headers) headers = {};
    Object.assign(headers, {
      'Content-Type': 'application/json'
    });
    return headers;
  }
}
