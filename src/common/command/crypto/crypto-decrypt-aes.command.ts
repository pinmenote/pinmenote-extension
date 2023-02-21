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
import { decrypt, enums, readMessage } from 'openpgp';
import { ICommand } from '../../model/shared/common.dto';

export class CryptoDecryptAesCommand implements ICommand<Promise<string>> {
  constructor(private message: string, private password: string) {}
  async execute(): Promise<string> {
    const message = await readMessage({
      armoredMessage: this.message
    });
    const decryptedData = await decrypt({
      message,
      passwords: [this.password],
      config: { preferredSymmetricAlgorithm: enums.symmetric.aes256 }
    });
    return decryptedData.data.toString();
  }
}
