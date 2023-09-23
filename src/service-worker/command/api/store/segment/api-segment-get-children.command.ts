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
import { SegmentHashListResponse } from '../api-store.model';
import { fnConsoleLog } from '../../../../../common/fn/fn-console';

export class ApiSegmentGetChildrenCommand
  extends ApiCallBase
  implements ICommand<Promise<SegmentHashListResponse | undefined>>
{
  constructor(private hash: string) {
    super();
  }
  async execute(): Promise<SegmentHashListResponse | undefined> {
    await this.initTokenData();
    if (!this.storeUrl) return;
    try {
      const resp = await FetchService.fetch<SegmentHashListResponse>(
        `${this.storeUrl}/api/v1/segment/children/${this.hash}`,
        { headers: this.getAuthHeaders() },
        this.refreshParams()
      );
      return resp.data;
    } catch (e) {
      fnConsoleLog('ApiSegmentGetChildrenCommand->Error', e);
    }
    throw new Error('ApiSegmentGetChildrenCommand->execute');
  }
}
