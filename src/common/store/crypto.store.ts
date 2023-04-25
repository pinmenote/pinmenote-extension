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
import { PrivateKey, PublicKey, readKey, readPrivateKey } from 'openpgp';
import { BrowserStorageWrapper } from '../service/browser.storage.wrapper';

export interface CryptoKey {
  privateKey?: PrivateKey;
  publicKey?: PublicKey;
  revocationCertificate: string;
}

export interface CryptoKeyData {
  privateKey: string;
  publicKey: string;
  revocationCertificate: string;
}

export class CryptoStore {
  static readonly PRIVATE_KEY = 'key:prv';
  static readonly PUBLIC_KEY = 'key:pub';
  static readonly PUBLIC_KEY_LIST = 'key:list';

  private static keyData?: CryptoKey;
  private static armoredPublicKey: string;
  private static armoredPrivateKey: string;

  static get cryptoKey(): CryptoKey | undefined {
    return this.keyData;
  }

  static get keyFingerprint(): string | undefined {
    return this.keyData?.privateKey?.getFingerprint();
  }

  static get publicKey(): string {
    return this.armoredPublicKey;
  }

  static get privateKey(): string {
    return this.armoredPrivateKey;
  }

  static async loadKeys(): Promise<boolean> {
    if (this.keyData) return true;

    const keyData = await BrowserStorageWrapper.get<CryptoKeyData | undefined>(this.PRIVATE_KEY);
    if (!keyData) return false;

    this.armoredPublicKey = keyData.publicKey;
    this.armoredPrivateKey = keyData.privateKey;

    const privateKey = await readPrivateKey({ armoredKey: keyData.privateKey });
    const publicKey = await readKey({ armoredKey: keyData.publicKey });

    this.keyData = { privateKey, publicKey, revocationCertificate: keyData.revocationCertificate };

    return true;
  }

  static async delPrivateKey(): Promise<void> {
    this.keyData = undefined;
    await BrowserStorageWrapper.remove(this.PRIVATE_KEY);
  }

  /* User public keys */

  static async addUserPublicKey(username: string, publicKey: string): Promise<boolean> {
    const usernameList = await this.getUsernameKeyList();

    if (usernameList.indexOf(username) > -1) return false;

    usernameList.push(username);
    await this.saveUsernameKeyList(usernameList);

    const key = `${this.PUBLIC_KEY}:${username}`;
    await BrowserStorageWrapper.set(key, publicKey);
    return true;
  }

  static async getUserPublicKey(username: string): Promise<string | undefined> {
    const key = `${this.PUBLIC_KEY}:${username}`;
    return await BrowserStorageWrapper.get<string | undefined>(key);
  }

  static async delUserPublicKey(username: string): Promise<void> {
    const usernameList = await this.getUsernameKeyList();

    const usernameIndex = usernameList.indexOf(username);
    if (usernameIndex === -1) return;

    usernameList.splice(usernameIndex, 1);
    await this.saveUsernameKeyList(usernameList);

    const key = `${this.PUBLIC_KEY}:${username}`;
    await BrowserStorageWrapper.remove(key);
  }

  static async getUsernameKeyList(): Promise<string[]> {
    const value = await BrowserStorageWrapper.get<string[] | undefined>(this.PUBLIC_KEY_LIST);
    return value || [];
  }

  private static async saveUsernameKeyList(usernameList: string[]): Promise<void> {
    await BrowserStorageWrapper.set(this.PUBLIC_KEY_LIST, usernameList);
  }
}
