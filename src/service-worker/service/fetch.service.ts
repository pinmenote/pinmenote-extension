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
import { fnConsoleLog } from '../../common/fn/fn-console';

export class FetchService {
  static async post<T>(
    url: string,
    data?: any,
    authenticate = false,
    type = ResponseType.JSON
  ): Promise<FetchResponse<T>> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);

    const requestInit = { method: 'POST', body: data ? JSON.stringify(data) : undefined };

    if (authenticate) {
      const headers = this.applyDefaultHeaders(await ApiHelper.getAuthHeaders());

      return await this.refetch(url, { ...requestInit, headers }, type);
    }
    const req = await fetch(url, { ...requestInit, headers: this.applyDefaultHeaders() });
    const res = await this.getResponse(req, type);
    return { url, type: ResponseType.JSON, status: req.status, res, ok: req.ok };
  }

  static async patch<T>(
    url: string,
    data?: any,
    authenticate = false,
    type = ResponseType.JSON
  ): Promise<FetchResponse<T>> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);

    const requestInit = { method: 'PATCH', body: data ? JSON.stringify(data) : undefined };

    if (authenticate) {
      const headers = this.applyDefaultHeaders(await ApiHelper.getAuthHeaders());
      return await this.refetch(url, { ...requestInit, headers }, type);
    }
    const req = await fetch(url, { ...requestInit, headers: this.applyDefaultHeaders() });
    const res = await this.getResponse(req, type);
    return { url, type: ResponseType.JSON, status: req.status, res, ok: req.ok };
  }

  static async delete<T>(url: string, authenticate = false, type = ResponseType.JSON): Promise<FetchResponse<T>> {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);

    const requestInit = { method: 'DELETE' };

    if (authenticate) {
      const headers = await ApiHelper.getAuthHeaders();
      return await this.refetch(url, { ...requestInit, headers }, type);
    }
    const req = await fetch(url, { ...requestInit, headers: this.applyDefaultHeaders() });
    const res = await this.getResponse(req, type);
    return { url, type: ResponseType.JSON, status: req.status, res, ok: req.ok };
  }

  static async get<T>(url: string, authenticate = false, type = ResponseType.JSON): Promise<FetchResponse<T>> {
    // No clue why AbortController abort doesn't work for Steve Jobs - probably he is still there aborting flash bandwagon
    // https://web.archive.org/web/20100501010616/http://www.apple.com/hotnews/thoughts-on-flash/
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        fnConsoleLog('FetchService->timeout', url);
        reject(`Timeout ${url}`);
      }, 15000);
      if (authenticate) {
        ApiHelper.getAuthHeaders()
          .then((headers) => {
            this.refetch<T>(url, { method: 'GET', headers }, type)
              .then((res) => {
                clearTimeout(timeout);
                resolve(res);
              })
              .catch((e) => fnConsoleLog('Error FetchService->refetch', e));
          })
          .catch((e) => fnConsoleLog('Error FetchService->getAuthHeaders', e));
      }
      fetch(url, { method: 'GET' })
        .then((req) => {
          // I don't know but this maybe stuck on limbo state cause of Steve Jobs haunting on his thoughts
          this.getResponse(req, type)
            .then((res) => {
              clearTimeout(timeout);
              resolve({ url, ok: req.ok, status: req.status, type, res });
            })
            .catch((e) => fnConsoleLog('Error FetchService->getResponse', e));
        })
        .catch((e) => fnConsoleLog('Error FetchService->fetch', e));
    });
  }

  private static getResponse = async (req: Response, type: ResponseType) => {
    if (type === ResponseType.BLOB) {
      return await req.blob();
    } else if (type === ResponseType.JSON) {
      return await req.json();
    }
    return await req.text();
  };

  private static async refreshToken(): Promise<void> {
    try {
      fnConsoleLog('FetchService->refreshToken', ApiHelper.authUrl);
      const req = await fetch(`${ApiHelper.authUrl}/refresh-token`, {
        method: 'PUT',
        headers: await ApiHelper.getAuthHeaders()
      });

      if (req.status !== 200) return;

      const res = await req.json();
      await new TokenStorageSetCommand(res).execute();
    } catch (e) {
      fnConsoleLog('ERROR REFRESH TOKEN', e);
      await new TokenStorageRemoveCommand().execute();
    }
  }

  private static refetch = async <T>(
    url: string,
    init: RequestInit,
    type = ResponseType.JSON
  ): Promise<FetchResponse<T>> => {
    let req = await fetch(url, init);
    const res = await req.json();

    if (!req.ok && type === ResponseType.JSON && res.message === 'jwt expired') {
      await this.refreshToken();
      const authHeaders = await ApiHelper.getAuthHeaders();
      if (init?.headers) init.headers = { ...init?.headers, ...authHeaders };

      req = await fetch(url, init);
      //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    } else if (req.headers.get('x-refresh-token') === 'yes') {
      // Forced by server
      await this.refreshToken();
    }
    return { url, ok: req.ok, status: req.status, type, res };
  };

  private static applyDefaultHeaders(headers?: { [key: string]: string }): { [key: string]: string } {
    if (!headers) headers = {};
    Object.assign(headers, {
      'Content-Type': 'application/json'
    });
    return headers;
  }
}
