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
import { Message, PublicKey, createMessage, encrypt, readKey } from 'openpgp';
import { ICommand } from '../../model/shared/common.model';

export class CryptoEncryptCommand implements ICommand<Promise<string | undefined>> {
  constructor(private text: string, private armoredKey: string) {}

  async execute(): Promise<string | undefined> {
    const message: Message<string> = await createMessage({ text: this.text });

    // Public key
    const encryptionKeys: PublicKey = await readKey({ armoredKey: this.armoredKey });

    const encrypted = await encrypt({ message, encryptionKeys });
    return encrypted.toString();
  }
}
