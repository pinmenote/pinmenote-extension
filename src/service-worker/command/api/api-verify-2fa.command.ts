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
import { AccessTokenDto, VerifyTokenDto } from '../../../common/model/shared/token.dto';
import { FetchResponse, FetchService } from '@pinmenote/fetch-service';
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { ApiCallBase } from './api-call.base';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { ApiErrorCode } from '../../../common/model/shared/api.error-code';
import { ApiAuthUrlCommand } from './api-auth-url.command';

export class ApiVerify2faCommand
  extends ApiCallBase
  implements ICommand<Promise<FetchResponse<AccessTokenDto | ServerErrorDto>>>
{
  constructor(private data: VerifyTokenDto) {
    super();
  }

  async execute(): Promise<FetchResponse<AccessTokenDto | ServerErrorDto>> {
    fnConsoleLog('ApiVerify2faCommand->execute');
    const baseUrl = await new ApiAuthUrlCommand().execute();
    const url = `${baseUrl}/api/v1/2fa/verify`;
    try {
      return await FetchService.fetch<AccessTokenDto>(url, {
        method: 'POST',
        body: JSON.stringify(this.data)
      });
    } catch (e) {
      return {
        ok: false,
        url,
        status: 500,
        type: 'JSON',
        data: { code: ApiErrorCode.INTERNAL, message: 'Send request problem' }
      };
    }
  }
}
