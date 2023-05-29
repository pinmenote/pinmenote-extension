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
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../model/obj/obj.dto';
import { BrowserApi } from '../../service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { BusMessageType } from '../../model/bus.model';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjAddIdCommand } from '../obj/id/obj-add-id.command';
import { ObjNextIdCommand } from '../obj/id/obj-next-id.command';
import { ObjPageDto } from '../../model/obj/obj-page.dto';
import { ObjSnapshotDto } from '../../model/obj/obj-snapshot.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { WordIndex } from '../../text/index/word.index';

export class PageSnapshotAddCommand implements ICommand<Promise<void>> {
  constructor(private dto: ObjSnapshotDto, private type: ObjTypeDto) {}

  async execute(): Promise<void> {
    const id = await new ObjNextIdCommand(ObjectStoreKeys.OBJECT_ID).execute();
    const dt = Date.now();

    const dto: ObjDto<ObjPageDto> = {
      id,
      type: this.type,
      createdAt: dt,
      updatedAt: dt,
      data: { snapshot: this.dto, comments: { data: [] } },
      version: OBJ_DTO_VERSION,
      local: {}
    };
    await WordIndex.indexFlat(this.dto.words, id);

    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;
    await BrowserStorageWrapper.set(key, dto);

    await LinkHrefStore.add(this.dto.url, id);

    await new ObjAddIdCommand({ id, dt }).execute();

    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.CONTENT_STOP_LISTENERS });
  }
}
