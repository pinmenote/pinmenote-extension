/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ApiStore } from '../../store/api.store';
import { FetchService } from '../../service/fetch.service';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import DiskQuotaDto = Pinmenote.Account.DiskQuotaDto;
import ICommand = Pinmenote.Common.ICommand;

export class ApiSyncQuotaCommand implements ICommand<Promise<DiskQuotaDto>> {
  async execute(): Promise<DiskQuotaDto> {
    const username = await ApiStore.getUsername();
    const url = `${environmentConfig.apiUrl}/api/v1/sync/${username}/quota`;
    const authHeaders = await ApiStore.getAuthHeaders();
    const quota = await FetchService.get<DiskQuotaDto>(url, authHeaders);
    fnConsoleLog('WorkerApiManager->syncQuota', quota);
    return quota;
  }
}
