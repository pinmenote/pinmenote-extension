/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { CryptoStore } from '../../store/crypto.store';
import { encryptKey } from 'openpgp';
import ICommand = Pinmenote.Common.ICommand;

export class CryptoEncryptPrivateKeyCommand implements ICommand<Promise<string | undefined>> {
  constructor(private password: string) {}
  async execute(): Promise<string | undefined> {
    await CryptoStore.loadKeys();
    if (!CryptoStore.cryptoKey?.privateKey) return undefined;
    const keyOutput = await encryptKey({
      privateKey: CryptoStore.cryptoKey.privateKey,
      passphrase: this.password
    });
    return btoa(keyOutput.armor());
  }
}
