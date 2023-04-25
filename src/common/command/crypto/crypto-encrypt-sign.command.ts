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
import { Message, createMessage, encrypt } from 'openpgp';
import { CryptoStore } from '../../store/crypto.store';
import { ICommand } from '../../model/shared/common.dto';

export class CryptoEncryptSignCommand implements ICommand<Promise<string>> {
  constructor(private value: object) {}
  async execute(): Promise<string> {
    await CryptoStore.loadKeys();
    const text = JSON.stringify(this.value);
    const message: Message<string> = await createMessage({ text });

    const encrypted = await encrypt({
      message,
      encryptionKeys: CryptoStore.cryptoKey?.publicKey,
      signingKeys: CryptoStore.cryptoKey?.privateKey
    });
    return encrypted.toString();
  }
}
