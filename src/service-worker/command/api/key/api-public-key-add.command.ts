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
import { FetchResponse, FetchService } from '@pinmenote/fetch-service';
import { ApiHelper } from '../../../api/api-helper';
import { CryptoStore } from '../../../../common/store/crypto.store';
import { apiResponseError } from '../api.model';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

export class ApiPublicKeyAddCommand implements ICommand<Promise<FetchResponse<BoolDto | ServerErrorDto>>> {
  async execute(): Promise<FetchResponse<BoolDto | ServerErrorDto>> {
    fnConsoleLog('ApiPublicKeyAddCommand->execute');

    const storeUrl = await ApiHelper.getStoreUrl();
    const url = `${storeUrl}/api/v1/key/public`;

    await CryptoStore.loadKeys();
    if (!CryptoStore.cryptoKey) return { url, ...apiResponseError };

    try {
      const headers = await ApiHelper.getAuthHeaders();
      return await FetchService.fetch<BoolDto>(url, {
        method: 'POST',
        headers,
        data: { key: CryptoStore.publicKey }
      });
    } catch (e) {
      return { url, ...apiResponseError };
    }
  }
}
