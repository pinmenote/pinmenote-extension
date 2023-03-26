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

export enum ResponseType {
  JSON = 1,
  TEXT,
  BLOB
}

export interface FetchResponse<T> {
  url: string;
  ok: boolean;
  status: number;
  res: T;
  type: ResponseType;
}

export interface KeyStatusResponse {
  hasPublicKey: boolean;
  hasPrivateKey: boolean;
}
