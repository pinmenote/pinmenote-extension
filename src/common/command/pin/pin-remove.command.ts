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
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjPagePinDto } from '../../model/obj/obj-pin.dto';
import { ObjRemoveHashtagsCommand } from '../obj/hashtag/obj-remove-hashtags.command';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/console.fn';

export class PinRemoveCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjPagePinDto>) {}
  async execute(): Promise<void> {
    fnConsoleLog('WorkerPinManager->pinRemove', this.obj);
    await BrowserStorageWrapper.remove(`${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`);
    await LinkHrefOriginStore.delHrefOriginId(this.obj.data.snapshot.url, this.obj.id);

    await new ObjRemoveIdCommand(this.obj.id, new Date(this.obj.createdAt)).execute();

    await new ObjRemoveHashtagsCommand(this.obj.id, this.obj.hashtags).execute();
  }
}
