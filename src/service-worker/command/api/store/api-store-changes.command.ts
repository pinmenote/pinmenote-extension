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
import { FetchResponse, FetchService } from '@pinmenote/fetch-service';
import { ApiHelper } from '../../../api/api-helper';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

interface ChangesDto {
  data: number[];
}

export class ApiStoreChangesCommand implements ICommand<Promise<FetchResponse<ChangesDto> | undefined>> {
  constructor(private dt: string) {}

  async execute(): Promise<FetchResponse<ChangesDto> | undefined> {
    fnConsoleLog('ApiStoreChangesCommand->execute');
    const storeUrl = await ApiHelper.getStoreUrl();

    const url = `${storeUrl}/api/v1/changes?dt=${this.dt}`;

    try {
      const headers = await ApiHelper.getAuthHeaders();
      return await FetchService.fetch<ChangesDto>(url, { headers });
    } catch (e) {
      fnConsoleLog('ApiStoreChangesCommand->Error', e);
    }
  }
}
