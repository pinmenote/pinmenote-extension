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
import { ApiHelper } from '../../../api/api-helper';
import { FetchResponse } from '../../../../common/model/api.model';
import { FetchService } from '../../../service/fetch.service';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjAddResultDto } from '../../../../common/model/obj/obj-server.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

export class ApiStoreAddObjectCommand implements ICommand<Promise<FetchResponse<ObjAddResultDto> | undefined>> {
  constructor(private obj: ObjDto) {}

  async execute(): Promise<FetchResponse<ObjAddResultDto> | undefined> {
    const storeUrl = await ApiHelper.getStoreUrl();
    const url = `${storeUrl}/api/v1/obj/add`;

    try {
      return await FetchService.post<ObjAddResultDto>(url, this.obj, true);
    } catch (e) {
      fnConsoleLog('ApiStoreAddObjectCommand->Error', e);
    }
  }
}
