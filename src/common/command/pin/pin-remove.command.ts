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
import { ObjUrlDto } from '../../model/obj/obj.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { PinIframeDto } from '../../model/obj/obj-pin.dto';
import { fnConsoleLog } from '../../fn/fn-console';

export class PinRemoveCommand implements ICommand<void> {
  constructor(private id: number, private url: ObjUrlDto, private iframe?: PinIframeDto) {}
  async execute(): Promise<void> {
    fnConsoleLog('PinRemoveCommand->execute', this.id);
    await BrowserStorageWrapper.remove(`${ObjectStoreKeys.PIN_ID}:${this.id}`);
    await LinkHrefOriginStore.pinDel(this.url, this.id);
    if (this.iframe) await LinkHrefOriginStore.pinDel(this.iframe.url, this.id);
  }
}
