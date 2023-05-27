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
import { ObjDto, ObjPageDataDto, ObjUrlDto } from '../../../model/obj/obj.dto';
import { ICommand } from '../../../model/shared/common.dto';
import { LinkHrefOriginStore } from '../../../store/link-href-origin.store';
import { ObjGetCommand } from '../obj-get.command';
import { ObjPinGetCommand } from '../obj-pin-get.command';

export class ObjGetHrefCommand implements ICommand<Promise<ObjDto<ObjPageDataDto>[]>> {
  constructor(private data: ObjUrlDto) {}

  async execute(): Promise<ObjDto<ObjPageDataDto>[]> {
    const out: ObjDto<ObjPageDataDto>[] = [];
    const pinIds = (await LinkHrefOriginStore.pinIds(this.data.href)).reverse();
    for (const id of pinIds) {
      const obj = await new ObjPinGetCommand(id).execute();
      out.push(obj);
    }
    const ids = (await LinkHrefOriginStore.hrefIds(this.data.href)).reverse();
    for (const id of ids) {
      const obj = await new ObjGetCommand<ObjPageDataDto>(id).execute();
      out.push(obj);
    }
    return out;
  }
}
