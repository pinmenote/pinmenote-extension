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
import { ObjSingleChange } from '../api-store.model';
import { ICommand } from '../../../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../../../common/fn/fn-console';

export class ApiObjGetChangesCommand extends ApiCallBase implements ICommand<Promise<ObjSingleChange | undefined>> {
  constructor(private authUrl: string, private id: number) {
    super();
  }
  async execute(): Promise<ObjSingleChange | undefined> {
    await this.initTokenData();
    if (!this.storeUrl) return;
    try {
      const resp = await FetchService.fetch<ObjSingleChange>(
        `${this.storeUrl}/api/v1/obj/${this.id}`,
        { headers: this.getAuthHeaders() },
        this.refreshParams(this.authUrl)
      );
      fnConsoleLog('ApiStoreChangesCommand->response', resp);
      return resp.data;
    } catch (e) {
      fnConsoleLog('ApiStoreChangesCommand->Error', e);
    }
  }
}
