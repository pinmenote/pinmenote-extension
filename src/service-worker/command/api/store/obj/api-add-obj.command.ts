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
import { ObjDto, ObjTypeDto } from '../../../../../common/model/obj/obj.dto';
import { ApiCallBase } from '../../api-call.base';
import { FetchService } from '@pinmenote/fetch-service';
import { ICommand, ServerErrorDto } from '../../../../../common/model/shared/common.dto';
import { ApiErrorCode } from '../../../../../common/model/shared/api.error-code';

export interface ObjAddRequest {
  type: ObjTypeDto;
  localId: number;
  initialHash: string;
}

export interface ObjAddResponse {
  serverId: number;
}

export class ApiAddObjCommand extends ApiCallBase implements ICommand<Promise<ObjAddResponse | ServerErrorDto>> {
  constructor(private obj: ObjDto, private hash: string, private tx: string) {
    super();
  }
  async execute(): Promise<ObjAddResponse | ServerErrorDto> {
    await this.initTokenData();
    if (!this.storeUrl) return { code: ApiErrorCode.INTERNAL, message: 'ApiStoreAddObjCommand' };
    const resp = await FetchService.fetch<ObjAddResponse | ServerErrorDto>(
      `${this.storeUrl}/api/v1/obj/${this.tx}`,
      {
        headers: this.getAuthHeaders(),
        method: 'POST',
        body: JSON.stringify({
          type: this.obj.type,
          localId: this.obj.id,
          hash: this.hash
        })
      },
      this.refreshParams()
    );
    // fnConsoleLog('ApiStoreSyncInfoCommand->response', resp);
    return resp.data;
  }
}
