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
import { BoolDto, ICommand, ServerErrorDto } from '../../../../common/model/shared/common.dto';
import { FetchResponse, ResponseType } from '../../../../common/model/api.model';
import { ApiHelper } from '../../../api/api-helper';
import { FetchService } from '../../../service/fetch.service';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

export class ApiStoreAddObjectCommand implements ICommand<Promise<FetchResponse<BoolDto | ServerErrorDto>>> {
  constructor(private obj: ObjDto) {}

  async execute(): Promise<FetchResponse<BoolDto | ServerErrorDto>> {
    fnConsoleLog('ApiStoreAddObjectCommand->execute');
    const storeUrl = await ApiHelper.getStoreUrl();

    const url = `${storeUrl}/api/v1/store/obj/add`;

    try {
      return await FetchService.post<BoolDto>(url, this.obj, true);
    } catch (e) {
      return {
        ok: false,
        url,
        status: 500,
        type: ResponseType.JSON,
        res: { message: 'Send request problem' }
      };
    }
  }
}
