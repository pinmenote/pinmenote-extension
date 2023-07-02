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
import XXH from 'xxhashjs';
import { sha256 } from 'js-sha256';

export const fnSha256 = (value: string): string => {
  return sha256(value);
};

export const fnSha256Object = (value: any): string => {
  return sha256(JSON.stringify(value));
};

export const fnXxhash = (value: string): number => {
  return XXH.h32(value, 0xabcd).toNumber();
};