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
import { PrivateKey, PublicKey, readKey, readPrivateKey } from 'openpgp';
import { BrowserStorageWrapper } from '@common/service/browser.storage.wrapper';

export interface CryptoKey {
  privateKey?: PrivateKey;
  publicKey?: PublicKey;
  revocationCertificate: string;
}

export interface CryptoPublicKey {
  username: string;
  key: PublicKey;
}

export interface CryptoKeyData {
  privateKey: string;
  publicKey: string;
  revocationCertificate: string;
}

export class CryptoStore {
  static readonly PRIVATE_KEY = 'key:prv';
  static readonly PUBLIC_KEY = 'key:pub';

  private static keyData?: CryptoKey;

  static get cryptoKey(): CryptoKey | undefined {
    return this.keyData;
  }

  static get keyFingerprint(): string | undefined {
    return this.keyData?.privateKey?.getFingerprint();
  }

  static async loadKeys(): Promise<boolean> {
    if (this.keyData) return true;
    const keyData = await BrowserStorageWrapper.get<CryptoKeyData | undefined>(this.PRIVATE_KEY);
    if (!keyData) return false;
    const privateKey = await readPrivateKey({ armoredKey: keyData.privateKey });
    const publicKey = await readKey({ armoredKey: keyData.publicKey });
    this.keyData = { privateKey, publicKey, revocationCertificate: keyData.revocationCertificate };
    return true;
  }

  static async readPublicKey(username: string): Promise<CryptoPublicKey | undefined> {
    const key = `${this.PUBLIC_KEY}:${username}`;
    return await BrowserStorageWrapper.get<CryptoPublicKey | undefined>(key);
  }

  static async delPrivateKey(): Promise<void> {
    await BrowserStorageWrapper.remove(this.PRIVATE_KEY);
  }
}
