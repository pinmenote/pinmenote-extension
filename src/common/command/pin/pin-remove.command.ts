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
import { ObjDto, ObjUrlDto } from '../../model/obj/obj.dto';
import { ObjPinDto, PinIframeDto } from '../../model/obj/obj-pin.dto';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { PinRemoveCommentListCommand } from './comment/pin-remove-comment-list.command';
import { fnConsoleLog } from '../../fn/fn-console';

export class PinRemoveCommand implements ICommand<void> {
  constructor(private id: number, private url: ObjUrlDto, private iframe?: PinIframeDto) {}
  async execute(): Promise<void> {
    fnConsoleLog('PinRemoveCommand->execute', this.id);

    const key = `${ObjectStoreKeys.PIN_ID}:${this.id}`;
    const pin = await BrowserStorage.get<ObjDto<ObjPinDto> | undefined>(key);
    if (!pin) return;

    await BrowserStorage.remove(key);

    await LinkHrefStore.pinDel(this.url, this.id);

    await new PinRemoveCommentListCommand(pin).execute();

    if (this.iframe) await LinkHrefStore.pinDel(this.iframe.url, this.id);
  }
}
