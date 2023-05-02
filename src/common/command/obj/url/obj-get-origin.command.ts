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
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ICommand } from '../../../model/shared/common.dto';
import { LinkHrefOriginStore } from '../../../store/link-href-origin.store';
import { ObjNoteDto } from '../../../model/obj/obj-note.dto';
import { ObjPagePinDto } from '../../../model/obj/obj-pin.dto';
import { ObjSnapshotDto } from '../../../model/obj/obj-snapshot.dto';
import { ObjTaskDto } from '../../../model/obj/obj-task.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';

export class ObjGetOriginCommand implements ICommand<Promise<ObjDto<ObjPageDataDto>[]>> {
  constructor(private data: ObjUrlDto) {}

  async execute(): Promise<ObjDto<ObjPageDataDto>[]> {
    const pinIds = (await LinkHrefOriginStore.originIds(this.data.origin)).reverse();
    const out: ObjDto<ObjPageDataDto>[] = [];
    for (const id of pinIds) {
      const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;
      const obj = await BrowserStorageWrapper.get<ObjDto<ObjPageDataDto>>(key);
      if (obj.type === ObjTypeDto.PageElementPin) {
        if ((obj.data as ObjPagePinDto).snapshot.url.href === this.data.href) continue;
      } else if (obj.type === ObjTypeDto.PageSnapshot || obj.type === ObjTypeDto.PageElementSnapshot) {
        if ((obj.data as ObjSnapshotDto).url.href === this.data.href) continue;
      } else if (obj.type === ObjTypeDto.PageNote) {
        if ((obj.data as ObjNoteDto).url?.href === this.data.href) continue;
      } else if (obj.type === ObjTypeDto.PageTask) {
        if ((obj.data as ObjTaskDto).url?.href === this.data.href) continue;
      }
      out.push(obj);
      // TODO pagination - now show last 10
      if (out.length === 10) break;
    }
    return out;
  }
}
