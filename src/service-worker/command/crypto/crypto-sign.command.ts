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
import { Message, createMessage, sign } from 'openpgp';
import { CryptoStore } from '../../store/crypto.store';
import { ICommand } from '../../../common/model/shared/common.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class CryptoSignCommand implements ICommand<Promise<string>> {
  constructor(private text: string) {}

  async execute(): Promise<string> {
    await CryptoStore.loadKeys();
    if (!CryptoStore.cryptoKey?.privateKey) throw new Error('Private key not found');
    const message: Message<string> = await createMessage({ text: this.text });
    const armoredSignature = await sign({
      message,
      signingKeys: CryptoStore.cryptoKey.privateKey,
      detached: true
    });
    fnConsoleLog('WorkerCryptoManager->sign->text', this.text);
    fnConsoleLog('WorkerCryptoManager->sign->signature', armoredSignature.toString());
    return armoredSignature.toString();
  }
}
