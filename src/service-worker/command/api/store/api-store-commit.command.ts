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
import { ApiCallBase } from '../api-call.base';
import { BeginTxResponse } from './api-store.model';
import { FetchService } from '@pinmenote/fetch-service';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

export class ApiStoreCommitCommand extends ApiCallBase implements ICommand<Promise<boolean>> {
  constructor(private authUrl: string, private tx: BeginTxResponse) {
    super();
  }
  async execute(): Promise<boolean> {
    await this.initTokenData();
    if (!this.storeUrl) return false;
    try {
      const resp = await FetchService.fetch<BeginTxResponse>(
        `${this.storeUrl}/api/v1/tx/${this.tx.tx}/commit`,
        {
          type: 'TEXT',
          headers: this.getAuthHeaders()
        },
        this.refreshParams(this.authUrl)
      );
      return resp.ok;
    } catch (e) {
      fnConsoleLog('ApiStoreBeginCommand->Error', e);
    }
    return false;
  }
}
