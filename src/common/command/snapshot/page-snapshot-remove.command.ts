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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjPageDto } from '../../model/obj/obj-pin.dto';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjRemoveSnapshotContentCommand } from '../obj/content/obj-remove-snapshot-content.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';

export class PageSnapshotRemoveCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto<ObjPageDto>) {}

  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;
    await BrowserStorageWrapper.remove(key);

    await new ObjRemoveIdCommand({ id: this.obj.id, dt: Date.now() }, this.obj.server?.id).execute();

    await LinkHrefStore.del(this.obj.data.snapshot.url, this.obj.id);

    await new ObjRemoveSnapshotContentCommand(this.obj.data.snapshot, this.obj.id).execute();
  }
}
