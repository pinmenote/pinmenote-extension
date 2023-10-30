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
import { ObjOverrideDto } from '../../model/obj/obj-override.dto';
import { ICommand } from '../../model/shared/common.dto';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjPageDto } from '../../model/obj/obj-page.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { ObjUpdateIndexAddCommand } from '../obj/index/obj-update-index-add.command';

export class PageSnapshotUpdateTitleCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto<ObjPageDto>, private override: ObjOverrideDto) {}

  async execute(): Promise<void> {
    this.obj.updatedAt = Date.now();
    this.obj.data.snapshot.override = this.override;

    await new ObjUpdateIndexAddCommand({ id: this.obj.id, dt: this.obj.updatedAt }).execute();

    await BrowserStorage.set<ObjDto<ObjPageDto>>(`${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`, this.obj);
  }
}
