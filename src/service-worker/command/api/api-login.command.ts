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
import { AccessTokenDto, LoginDto } from '../../../common/model/shared/token.dto';
import { FetchResponse, FetchService } from '@pinmenote/fetch-service';
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { ApiHelper } from '../../api/api-helper';
import { apiResponseError } from './api.model';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class ApiLoginCommand implements ICommand<Promise<FetchResponse<AccessTokenDto | ServerErrorDto>>> {
  constructor(private data: LoginDto) {}

  async execute(): Promise<FetchResponse<AccessTokenDto | ServerErrorDto>> {
    fnConsoleLog('ApiLoginCommand->execute');
    const url = `${ApiHelper.apiUrl}/api/v1/auth/login`;
    try {
      return await FetchService.fetch<AccessTokenDto | ServerErrorDto>(url, { method: 'POST', data: this.data });
    } catch (e) {
      return { url, ...apiResponseError };
    }
  }
}
