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
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjRemoveSnapshotContentCommand } from '../obj/content/obj-remove-snapshot-content.command';
import { ObjSnapshotDto } from '../../model/obj/obj-snapshot.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/console.fn';

export class PinRemoveCommand implements ICommand<void> {
  constructor(private id: number, private snapshot: ObjSnapshotDto, private serverId?: number) {}
  async execute(): Promise<void> {
    fnConsoleLog('PinRemoveCommand->execute', this.id);
    await BrowserStorageWrapper.remove(`${ObjectStoreKeys.OBJECT_ID}:${this.id}`);

    await LinkHrefOriginStore.delHrefOriginId(this.snapshot.url, this.id);
    await LinkHrefOriginStore.pinDel(this.snapshot.url, this.id);

    await new ObjRemoveIdCommand({ id: this.id, dt: Date.now() }, this.serverId).execute();

    await new ObjRemoveSnapshotContentCommand(this.snapshot, this.id).execute();
  }
}
