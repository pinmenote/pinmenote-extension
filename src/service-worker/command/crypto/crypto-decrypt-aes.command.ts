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
import { decrypt, readMessage } from 'openpgp';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class CryptoDecryptAesCommand implements ICommand<Promise<any>> {
  constructor(private message: string, private password: string) {}
  async execute(): Promise<any> {
    const message = await readMessage({
      binaryMessage: this.message
    });
    const decrypted = await decrypt({
      message,
      passwords: [this.password],
      format: 'binary'
    });
    fnConsoleLog('CryptoDecryptAesCommand->decrypted', decrypted);
    return decrypted;
  }
}
