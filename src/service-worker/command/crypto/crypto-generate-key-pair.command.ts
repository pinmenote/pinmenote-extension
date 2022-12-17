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
import { CryptoKeyData, CryptoStore } from '../../store/crypto.store';
import { BrowserStorageWrapper } from '@common/service/browser.storage.wrapper';
import { generateKey } from 'openpgp';
import ICommand = Pinmenote.Common.ICommand;

export class CryptoGenerateKeyPairCommand implements ICommand<Promise<CryptoKeyData>> {
  constructor(private name: string, private email: string) {}

  async execute(): Promise<CryptoKeyData> {
    const { privateKey, publicKey, revocationCertificate } = await generateKey({
      type: 'rsa',
      rsaBits: 2048,
      userIDs: [{ name: this.name, email: this.email, comment: 'pinmenote.com' }],
      format: 'armored'
    });
    const keyData = { privateKey, publicKey, revocationCertificate };
    await BrowserStorageWrapper.set<CryptoKeyData>(CryptoStore.PRIVATE_KEY, keyData);

    // load keys to variable after generation
    await CryptoStore.loadKeys();

    return keyData;
  }
}
