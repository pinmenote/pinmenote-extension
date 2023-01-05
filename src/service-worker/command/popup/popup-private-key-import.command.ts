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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { readPrivateKey } from 'openpgp';
import ICommand = Pinmenote.Common.ICommand;

export class PopupPrivateKeyImportCommand implements ICommand<void> {
  constructor(private data: string) {}
  async execute(): Promise<void> {
    try {
      await this.importPrivateKey(this.data);
      await BrowserApi.sendRuntimeMessage<string>({
        type: BusMessageType.POPUP_PRIVATE_KEY_GET,
        data: this.data
      });
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private async importPrivateKey(armoredKey: string): Promise<void> {
    const privateKey = await readPrivateKey({ armoredKey });
    const publicKey = privateKey.toPublic().armor();
    const keyData = { privateKey: armoredKey, publicKey, revocationCertificate: '' };
    await BrowserStorageWrapper.set<CryptoKeyData>(CryptoStore.PRIVATE_KEY, keyData);
  }
}
