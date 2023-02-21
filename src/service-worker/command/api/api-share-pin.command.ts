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
import { ObjDto, ObjShareDto } from '../../../common/model/obj/obj.dto';
import { ApiStore } from '../../store/api.store';
import { FetchService } from '../../service/fetch.service';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ApiSharePinCommand implements ICommand<Promise<ObjShareDto>> {
  constructor(private obj: ObjDto<ObjPagePinDto>) {}
  async execute(): Promise<ObjShareDto> {
    const authHeaders = await ApiStore.getAuthHeaders();
    fnConsoleLog('Send share', this.obj);
    const resp = await FetchService.post<ObjShareDto>(
      `${environmentConfig.url.api}/api/v1/share`,
      this.obj,
      authHeaders
    );
    fnConsoleLog('ApiSharePinCommand', resp);
    return resp;
  }
}
