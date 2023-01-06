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
import { ObjRemoveHashtagsCommand } from '../obj/hashtag/obj-remove-hashtags.command';
import { ObjRemoveIdCommand } from '../obj/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { PinHrefOriginStore } from '../../store/pin-href-origin.store';
import { PinObject } from '../../model/pin.model';
import { fnConsoleLog } from '../../fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class PinRemoveCommand implements ICommand<void> {
  constructor(private data: PinObject) {}
  async execute(): Promise<void> {
    fnConsoleLog('WorkerPinManager->pinRemove', this.data);
    await BrowserStorageWrapper.remove(`${ObjectStoreKeys.OBJECT_ID}:${this.data.id}`);
    await PinHrefOriginStore.delHrefOriginId(this.data.url, this.data.id);

    await new ObjRemoveIdCommand(this.data.id).execute();

    await new ObjRemoveHashtagsCommand(this.data.id, this.data.value).execute();
  }
}
