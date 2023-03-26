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
import { FetchResponse, ResponseType } from '../../../common/model/api.model';
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { ApiHelper } from '../../api/api-helper';
import { FetchService } from '../../service/fetch.service';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ApiVerify2faCommand implements ICommand<Promise<FetchResponse<AccessTokenDto | ServerErrorDto>>> {
  constructor(private data: VerifyTokenDto) {}

  async execute(): Promise<FetchResponse<AccessTokenDto | ServerErrorDto>> {
    fnConsoleLog('ApiVerify2faCommand->execute');
    const url = `${ApiHelper.apiUrl}/api/v1/auth/2fa/verify`;
    try {
      return await FetchService.post<AccessTokenDto>(url, this.data);
    } catch (e) {
      return {
        ok: false,
        url,
        status: 500,
        type: ResponseType.JSON,
        res: { message: 'Send request problem' }
      };
    }
  }
}
