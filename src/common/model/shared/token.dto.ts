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
export enum TokenTypeDto {
  Bearer = 'Bearer',
  GoogleAuthenticator = 'GoogleAuthenticator'
}

export interface RefreshTokenDto {
  token: string;
  iat: number;
  syncToken: string;
}

export interface AccessTokenDto {
  access_token: string;
  expires_in: number;
  token_type: TokenTypeDto;
}

export interface TokenDataDto {
  sub: string;
  exp: number;
  refresh_token: RefreshTokenDto;
  data: TokenUserDto;
}

export interface TokenUserDto {
  username: string;
  email: string;
  store: string;
  use2fa: boolean;
  subscribed: number;
  role: number[];
}

export interface LoginDto {
  email: string;
  password: string;
  source: string;
}

export interface VerifyTokenDto {
  totp: string;
  token: string;
  source: string;
}
