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
import { ICommand } from '../../../common/model/shared/common.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class PopupPrivateKeyGetCommand implements ICommand<void> {
  async execute(): Promise<void> {
    try {
      const data = await this.getArmoredPrivateKey();
      await BrowserApi.sendRuntimeMessage<string>({
        type: BusMessageType.POPUP_PRIVATE_KEY_GET,
        data
      });
    } catch (e) {
      fnConsoleLog('Error', e);
    }
  }

  private async getArmoredPrivateKey(): Promise<string | undefined> {
    const keyData = await BrowserStorageWrapper.get<CryptoKeyData | undefined>(CryptoStore.PRIVATE_KEY);
    if (!keyData) return undefined;
    return keyData?.privateKey;
  }
}
