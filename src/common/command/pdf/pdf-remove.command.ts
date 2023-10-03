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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjPdfDto } from '../../model/obj/obj-pdf.dto';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { HashtagStore } from '../../store/hashtag.store';
import { ObjDto, ObjRemovedDto, ObjTypeDto } from '../../model/obj/obj.dto';
import { ObjUpdateIndexAddCommand } from '../obj/index/obj-update-index-add.command';

export class PdfRemoveCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto<ObjPdfDto>) {}
  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;
    await BrowserStorage.remove(`${ObjectStoreKeys.PDF_DATA}:${this.obj.data.hash}`);

    await LinkHrefStore.del(this.obj.data.data.url, this.obj.id);

    await new ObjRemoveIdCommand(this.obj.id, ObjectStoreKeys.OBJECT_LIST).execute();

    if (this.obj.data.hashtags) {
      await HashtagStore.removeTags(
        this.obj.data.hashtags.data.map((t) => t.value),
        this.obj.id
      );
    }
    const obj: ObjRemovedDto = {
      id: this.obj.id,
      server: this.obj.server,
      type: ObjTypeDto.Removed,
      hash: this.obj.data.hash,
      removedAt: Date.now()
    };
    await new ObjUpdateIndexAddCommand({ id: obj.id, dt: obj.removedAt }).execute();
    await BrowserStorage.set<ObjRemovedDto>(key, obj);
  }
}
