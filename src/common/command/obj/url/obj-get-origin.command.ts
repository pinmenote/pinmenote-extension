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
import { ObjDto, ObjPageDataDto, ObjTypeDto, ObjUrlDto } from '../../../model/obj/obj.dto';
import { ICommand } from '../../../model/shared/common.dto';
import { LinkOriginStore } from '../../../store/link-origin.store';
import { ObjGetCommand } from '../obj-get.command';
import { ObjNoteDto } from '../../../model/obj/obj-note.dto';
import { ObjPageDto } from '../../../model/obj/obj-page.dto';
import { ObjPdfDto } from '../../../model/obj/obj-pdf.dto';
import { ObjPinDto } from '../../../model/obj/obj-pin.dto';
import { ObjTaskDto } from '../../../model/obj/obj-task.dto';
import { fnConsoleLog } from '../../../fn/fn-console';

export class ObjGetOriginCommand implements ICommand<Promise<ObjDto<ObjPageDataDto>[]>> {
  constructor(private data: ObjUrlDto) {}

  async execute(): Promise<ObjDto<ObjPageDataDto>[]> {
    const pinIds = (await LinkOriginStore.originIds(LinkOriginStore.PIN_ORIGIN, this.data.origin)).reverse();
    const objsIds = (await LinkOriginStore.originIds(LinkOriginStore.OBJ_ORIGIN, this.data.origin)).reverse();
    pinIds.push(...objsIds);
    const out: ObjDto<ObjPageDataDto>[] = [];
    for (const id of pinIds) {
      const obj = await new ObjGetCommand<ObjPageDataDto | ObjPinDto>(id).execute();
      if (!obj) {
        fnConsoleLog('PROBLEM !!!!!!!!!');
        continue;
      }
      if ([ObjTypeDto.PageSnapshot, ObjTypeDto.PageElementSnapshot].includes(obj.type)) {
        if ((obj.data as ObjPageDto).snapshot.info.url.href === this.data.href) continue;
      } else if (obj.type === ObjTypeDto.PageElementPin) {
        if ((obj.data as ObjPinDto).data.url.href === this.data.href) continue;
      } else if (obj.type === ObjTypeDto.PageNote) {
        if ((obj.data as ObjNoteDto).url?.href === this.data.href) continue;
      } else if (obj.type === ObjTypeDto.PageTask) {
        if ((obj.data as ObjTaskDto).url?.href === this.data.href) continue;
      } else if (obj.type === ObjTypeDto.Pdf) {
        if ((obj.data as ObjPdfDto).rawUrl === this.data.href) continue;
      }
      out.push(obj);
      // TODO pagination - now show last 10
      if (out.length === 10) break;
    }
    return out;
  }
}
