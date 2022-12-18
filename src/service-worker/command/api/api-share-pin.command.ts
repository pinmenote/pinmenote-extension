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
import { ObjectTypeDto } from '@common/model/html.model';
import { PinObject } from '@common/model/pin.model';
import { environmentConfig } from '@common/environment';
import { fnConsoleLog } from '@common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;
import NewShareDto = Pinmenote.Share.NewShareDto;
import ShareUrlDto = Pinmenote.Share.ShareUrlDto;

export class ApiSharePinCommand implements ICommand<Promise<ShareUrlDto>> {
  constructor(private data: PinObject) {}
  async execute(): Promise<ShareUrlDto> {
    const authHeaders = await ApiStore.getAuthHeaders();
    const { locator, url, value, updatedAt, createdAt } = this.data;
    const data: NewShareDto = {
      type: ObjectTypeDto.Pin,
      data: { locator, url, value, updatedAt, createdAt }
    };
    fnConsoleLog('Send share', data);
    const resp = await FetchService.post<ShareUrlDto>(`${environmentConfig.apiUrl}/api/v1/share`, data, authHeaders);
    fnConsoleLog('ApiSharePinCommand', resp);
    return resp;
  }
}
