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
import { BoolDto, ICommand } from '../../../common/model/shared/common.dto';
import { ApiHelper } from '../../api/api-helper';
import { FetchService } from '../../service/fetch.service';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ApiStoreAddObjectCommand implements ICommand<Promise<BoolDto>> {
  constructor(private obj: ObjDto) {}

  async execute(): Promise<BoolDto> {
    const storeUrl = await ApiHelper.getStoreUrl();

    const url = `${storeUrl}/api/v1/store/obj/add`;

    const resp = await FetchService.post<BoolDto>(url, this.obj, true);

    fnConsoleLog('ApiStoreAddObjectCommand->execute', resp);

    return resp;
  }
}