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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjDto } from '../../model/obj.model';
import { ObjPagePinDto } from '../../model/obj-pin.model';
import { ObjRemoveHashtagsCommand } from '../obj/hashtag/obj-remove-hashtags.command';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class PinRemoveCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjPagePinDto>) {}
  async execute(): Promise<void> {
    fnConsoleLog('WorkerPinManager->pinRemove', this.obj);
    await BrowserStorageWrapper.remove(`${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`);
    await LinkHrefOriginStore.delHrefOriginId(this.obj.data.url, this.obj.id);

    await new ObjRemoveIdCommand(this.obj.id, new Date(this.obj.createdAt)).execute();

    await new ObjRemoveHashtagsCommand(this.obj.id, this.obj.hashtags).execute();
  }
}
