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
import { ObjDto, ObjRemovedDto, ObjTypeDto, ObjUrlDto } from '../../model/obj/obj.dto';
import { ObjPinDto, PinIframeDto } from '../../model/obj/obj-pin.dto';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { PinRemoveCommentListCommand } from './comment/pin-remove-comment-list.command';
import { fnConsoleLog } from '../../fn/fn-console';
import { ObjUpdateIndexAddCommand } from '../obj/index/obj-update-index-add.command';

export class PinRemoveCommand implements ICommand<void> {
  constructor(private id: number, private url: ObjUrlDto, private iframe?: PinIframeDto) {}
  async execute(): Promise<void> {
    fnConsoleLog('PinRemoveCommand->execute', this.id);

    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.id}`;
    const pin = await BrowserStorage.get<ObjDto<ObjPinDto> | undefined>(key);
    if (!pin) return;

    await LinkHrefStore.pinDel(this.url, this.id);

    if (this.iframe) await LinkHrefStore.pinDel(this.iframe.url, this.id);

    // ObjRemovedDto gather all hashes
    const hash = await new PinRemoveCommentListCommand(pin).execute();

    hash.push(pin.data.data.hash);
    hash.push(pin.data.description.hash);
    hash.push(...pin.data.draw.data.map((d) => d.hash));
    if (pin.data.video) hash.push(pin.data.video.hash);

    const obj: ObjRemovedDto = {
      id: this.id,
      type: ObjTypeDto.Removed,
      hash,
      removedAt: Date.now()
    };

    await BrowserStorage.set<ObjRemovedDto>(key, obj);

    await new ObjUpdateIndexAddCommand({ id: this.id, dt: obj.removedAt }).execute();

    await new ObjRemoveIdCommand(this.id, ObjectStoreKeys.PIN_LIST).execute();
  }
}
