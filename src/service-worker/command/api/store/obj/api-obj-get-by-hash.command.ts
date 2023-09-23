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

import { ApiCallBase } from '../../api-call.base';
import { ICommand, ServerErrorDto } from '../../../../../common/model/shared/common.dto';
import { ApiErrorCode } from '../../../../../common/model/shared/api.error-code';
import { FetchService } from '@pinmenote/fetch-service';
import { BeginTxResponse, ObjSingleChange } from '../api-store.model';

export class ApiObjGetByHashCommand extends ApiCallBase implements ICommand<Promise<ObjSingleChange | ServerErrorDto>> {
  constructor(private hash: string, private tx: BeginTxResponse) {
    super();
  }
  async execute(): Promise<ObjSingleChange | ServerErrorDto> {
    await this.initTokenData();
    if (!this.storeUrl) return { code: ApiErrorCode.INTERNAL, message: 'ApiStoreObjGetByHashCommand' };
    const resp = await FetchService.fetch<ObjSingleChange | ServerErrorDto>(
      `${this.storeUrl}/api/v1/obj/hash/${this.hash}`,
      {
        headers: this.getAuthHeaders(),
        method: 'GET'
      },
      this.refreshParams()
    );
    // fnConsoleLog('ApiStoreObjGetByHashCommand->response', resp);
    return resp.data;
  }
}
