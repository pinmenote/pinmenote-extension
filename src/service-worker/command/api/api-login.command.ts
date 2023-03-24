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
import { FetchResponse, ResponseType } from '../../../common/model/api.model';
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { ApiHelper } from '../../api/api-helper';
import { FetchService } from '../../service/fetch.service';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ApiLoginCommand implements ICommand<Promise<FetchResponse<AccessTokenDto | ServerErrorDto>>> {
  constructor(private data: LoginDto) {}

  async execute(): Promise<FetchResponse<AccessTokenDto | ServerErrorDto>> {
    fnConsoleLog('ApiLoginCommand->execute', this.data);
    const url = `${ApiHelper.apiUrl}/api/v1/auth/login`;
    try {
      const data = await FetchService.post<AccessTokenDto>(`${ApiHelper.apiUrl}/api/v1/auth/login`, this.data);
      return data;
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
