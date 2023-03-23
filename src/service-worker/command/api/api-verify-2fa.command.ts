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
import { ApiHelper } from '../../api/api-helper';
import { FetchResponse } from '../../../common/model/api.model';
import { FetchService } from '../../service/fetch.service';
import { ICommand } from '../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ApiVerify2faCommand implements ICommand<Promise<FetchResponse<AccessTokenDto>>> {
  constructor(private data: VerifyTokenDto) {}

  async execute(): Promise<FetchResponse<AccessTokenDto>> {
    const data = await FetchService.post<AccessTokenDto>(`${ApiHelper.apiUrl}/api/v1/auth/2fa/verify`, this.data);

    fnConsoleLog('ApiVerify2faCommand->execute', data);

    return data;
  }
}
