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
import { DecryptOptions, Message, decrypt, readMessage } from 'openpgp';
import { CryptoStore } from '../../store/crypto.store';
import { ICommand } from '../../model/shared/common.dto';

export class CryptoDecryptCommand implements ICommand<Promise<string | undefined>> {
  constructor(private armoredMessage: string, private checkSignature = false) {}
  async execute(): Promise<string | undefined> {
    await CryptoStore.loadKeys();
    if (!CryptoStore.cryptoKey) return undefined;
    const message: Message<string> = await readMessage({ armoredMessage: this.armoredMessage });
    const opts: DecryptOptions = { message, decryptionKeys: CryptoStore.cryptoKey.privateKey };
    if (this.checkSignature) {
      opts.verificationKeys = CryptoStore.cryptoKey.publicKey;
    }
    const { data, signatures } = await decrypt(opts);
    if (this.checkSignature) {
      try {
        await signatures[0].verified;
      } catch (e: any) {
        throw new Error(`Invalid signature : ${(e as { message: string }).message}`);
      }
    }
    return data.toString();
  }
}
