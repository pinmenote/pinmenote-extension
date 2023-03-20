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
import { ObjDataDto, ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjRangeRequest } from 'src/common/model/obj-request.model';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class OptionsObjSearchCommand implements ICommand<Promise<ObjDto<ObjDataDto>[] | undefined>> {
  constructor(private data: ObjRangeRequest) {}

  async execute(): Promise<ObjDto<ObjDataDto>[] | undefined> {
    try {
      const data = await this.getSearch(ObjectStoreKeys.OBJECT_ID, this.data);
      return data;
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private async getSearch(idKey: string, range: ObjRangeRequest): Promise<ObjDto<ObjDataDto>[]> {
    if (!range.search || range.search?.length < 2) return [];
    const out: ObjDto<ObjDataDto>[] = [];
    const ids = (await this.getIds()).reverse();

    for (let i = 0; i < ids.length; i++) {
      // Skip those that were sent
      if (range.from && ids[i] >= range.from) continue;
      const key = `${idKey}:${ids[i]}`;
      const obj = await BrowserStorageWrapper.get<ObjDto<ObjDataDto>>(key);
      if (obj && obj.type === ObjTypeDto.PageElementPin && this.search(range.search, obj as ObjDto<ObjPagePinDto>)) {
        out.push(obj);
      }
      if (out.length > 5) {
        return out;
      }
    }
    return out;
  }

  private search(searchValue: string, pin: ObjDto<ObjPagePinDto>): boolean {
    if (pin.data.value.toLowerCase().indexOf(searchValue) > -1) return true;
    if (pin.data.url.href.indexOf(searchValue) > -1) return true;
    if (pin.data.title.toLowerCase().indexOf(searchValue) > -1) return true;
    return false;
  }

  private async getIds(): Promise<number[]> {
    const value = await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.OBJECT_LIST_ID);
    return value || [];
  }
}
