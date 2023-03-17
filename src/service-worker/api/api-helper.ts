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
import { TokenDataDto } from '../../common/model/shared/token.dto';
import { TokenStorageGetCommand } from '../../common/command/server/token/token-storage-get.command';
import { environmentConfig } from '../../common/environment';
import jwtDecode from 'jwt-decode';

export class ApiHelper {
  static async getAuthHeaders(): Promise<{ [key: string]: string }> {
    const token = await new TokenStorageGetCommand().execute();
    if (!token) return {};

    return {
      Authorization: `Bearer ${token.access_token}`
    };
  }

  static get apiUrl(): string {
    return environmentConfig.url.api;
  }

  static async getStoreUrl(): Promise<string> {
    const token = await new TokenStorageGetCommand().execute();
    if (!token) return '';

    const { data } = jwtDecode<TokenDataDto>(token.access_token);
    return data.store;
  }
}
