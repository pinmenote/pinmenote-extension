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
import { ICommand } from '../../../../../common/model/shared/common.dto';
import { ServerQuotaResponse } from '../../../../../common/model/sync-server.model';

export class ApiSegmentQuotaGetCommand extends ApiCallBase implements ICommand<Promise<ServerQuotaResponse>> {
  constructor() {
    super();
  }
  async execute(): Promise<ServerQuotaResponse> {
    await this.initTokenData();
    const resp = await FetchService.fetch<ServerQuotaResponse>(
      `${this.storeUrl!}/api/v1/segment/quota`,
      {
        type: 'JSON',
        headers: this.getAuthHeaders(true)
      },
      this.refreshParams()
    );
    return resp.data;
  }
}
