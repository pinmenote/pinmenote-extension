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
import { ApiCallBase } from './api-call.base';
import { apiResponseError } from './api.model';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { ApiAuthUrlCommand } from './api-auth-url.command';

export class ApiLoginCommand
  extends ApiCallBase
  implements ICommand<Promise<FetchResponse<AccessTokenDto | ServerErrorDto>>>
{
  constructor(private data: LoginDto) {
    super();
  }

  async execute(): Promise<FetchResponse<AccessTokenDto | ServerErrorDto>> {
    fnConsoleLog('ApiLoginCommand->execute');
    const baseUrl = await new ApiAuthUrlCommand().execute();
    const url = `${baseUrl}/api/v1/login`;
    try {
      return await FetchService.fetch<AccessTokenDto | ServerErrorDto>(url, {
        method: 'POST',
        body: JSON.stringify(this.data)
      });
    } catch (e) {
      fnConsoleLog('ApiLoginCommand', e, url);
      return { url, ...apiResponseError };
    }
  }
}
