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
import { FetchService } from '@pinmenote/fetch-service';
import { ICommand, ServerErrorDto } from '../../../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../../../common/fn/fn-console';
import { ObjChangesResponse } from '../api-store.model';
import { ApiErrorCode } from '../../../../../common/model/shared/api.error-code';

const errorResponse: ServerErrorDto = { code: ApiErrorCode.INTERNAL, message: 'Send request problem' };

export class ApiObjGetChangesCommand
  extends ApiCallBase
  implements ICommand<Promise<ObjChangesResponse | ServerErrorDto>>
{
  constructor(private authUrl: string, private serverId: number) {
    super();
  }
  async execute(): Promise<ObjChangesResponse | ServerErrorDto> {
    await this.initTokenData();
    if (!this.storeUrl) return errorResponse;
    try {
      const resp = await FetchService.fetch<ObjChangesResponse | ServerErrorDto>(
        `${this.storeUrl}/api/v1/obj/changes?serverId=${this.serverId}`,
        { headers: this.getAuthHeaders() },
        this.refreshParams(this.authUrl)
      );
      if (resp.status === 200) return resp.data;
      fnConsoleLog(resp);
      errorResponse.message = (resp.data as ServerErrorDto).message;
      return errorResponse;
    } catch (e) {
      fnConsoleLog('ApiObjGetChangesCommand->Error', e);
    }
    return errorResponse;
  }
}
