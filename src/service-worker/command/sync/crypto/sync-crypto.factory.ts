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
import { fnSleep } from '../../../../common/fn/fn-sleep';

export class SyncCryptoFactory {
  static async newKey(): Promise<string> {
    await fnSleep(1);
    return 'foo';
  }

  static async encrypt(data: string, key: string): Promise<string> {
    await fnSleep(1);
    if (key) return data;
    return data;
  }
}
