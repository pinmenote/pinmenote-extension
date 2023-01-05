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
import { Message, createMessage, readSignature, verify } from 'openpgp';
import { CryptoStore } from '../../store/crypto.store';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class CryptoVerifySignatureCommand implements ICommand<void> {
  constructor(private text: string, private armoredSignature: string) {}
  async execute(): Promise<void> {
    await CryptoStore.loadKeys();
    if (!CryptoStore.cryptoKey?.publicKey) throw new Error('Private key not found');

    const message: Message<string> = await createMessage({ text: this.text });
    const signature = await readSignature({
      armoredSignature: this.armoredSignature.toString()
    });

    const verificationResult = await verify({
      message,
      signature,
      verificationKeys: CryptoStore.cryptoKey.publicKey
    });
    const { verified, keyID } = verificationResult.signatures[0];
    await verified; // throws on invalid signature
    fnConsoleLog('Signed by key id ' + keyID.toHex());
  }
}
