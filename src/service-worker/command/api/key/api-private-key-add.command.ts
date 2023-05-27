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
import { BoolDto, ICommand, ServerErrorDto } from '../../../../common/model/shared/common.dto';
import { FetchResponse, ResponseType } from '../../../../common/model/api.model';
import { ApiHelper } from '../../../api/api-helper';
import { CryptoStore } from '../../../../common/store/crypto.store';
import { FetchService } from '../../../service/fetch.service';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

export class ApiPrivateKeyAddCommand implements ICommand<Promise<FetchResponse<BoolDto | ServerErrorDto>>> {
  private error = {
    ok: false,
    status: 500,
    type: ResponseType.JSON,
    res: { message: 'Send request problem' }
  };

  constructor(private key: string) {}

  async execute(): Promise<FetchResponse<BoolDto | ServerErrorDto>> {
    fnConsoleLog('ApiPrivateKeyAddCommand->execute');

    const storeUrl = await ApiHelper.getStoreUrl();
    const url = `${storeUrl}/api/v1/key/private`;

    await CryptoStore.loadKeys();
    if (!CryptoStore.cryptoKey) return { url, ...this.error };

    try {
      return await FetchService.post<BoolDto>(url, { key: this.key }, true);
    } catch (e) {
      return { url, ...this.error };
    }
  }
}
