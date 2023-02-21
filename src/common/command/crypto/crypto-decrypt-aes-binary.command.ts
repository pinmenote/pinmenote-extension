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
import { ICommand } from '../../model/shared/common.model';

export class CryptoDecryptAesBinaryCommand implements ICommand<Promise<Uint8Array>> {
  constructor(private message: Uint8Array, private password: string) {}

  async execute(): Promise<Uint8Array> {
    // const a = atob(this.message).split(',').map(e => parseInt(e));
    const message = await readMessage({
      binaryMessage: this.message
    });
    const decryptedData = await decrypt({
      message,
      passwords: [this.password],
      format: 'binary',
      config: { preferredSymmetricAlgorithm: enums.symmetric.aes256 }
    });
    // new TextDecoder().decode(decryptedData.data as Uint8Array)
    return Uint8Array.from(decryptedData.data as Iterable<number>);
  }
}
