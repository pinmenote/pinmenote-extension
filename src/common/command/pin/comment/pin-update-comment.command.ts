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
import { ICommand } from '../../../model/shared/common.dto';
import { ObjCommentDto } from '../../../model/obj/obj-comment.dto';
import { ObjDto } from '../../../model/obj/obj.dto';
import { ObjPinDto } from '../../../model/obj/obj-pin.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnConsoleLog } from '../../../fn/fn-console';
import { fnSha256Object } from '../../../fn/fn-hash';

export class PinUpdateCommentCommand implements ICommand<Promise<string | undefined>> {
  constructor(private pin: ObjDto<ObjPinDto>, private comment: ObjCommentDto, private value: string) {}

  async execute(): Promise<string | undefined> {
    const commentList = this.pin.data.comments;
    const hashIndex = commentList.data.indexOf(this.comment.hash);
    if (hashIndex === -1) return;

    const dt = Date.now();
    const comment: Partial<ObjCommentDto> = {
      value: this.value,
      createdAt: this.comment.createdAt,
      updatedAt: dt,
      prev: this.comment.hash
    };
    const hash = fnSha256Object(comment);
    fnConsoleLog('PinUpdateCommentCommand', hash, 'old', comment.prev);
    comment.hash = hash;

    await BrowserStorage.set(`${ObjectStoreKeys.PIN_COMMENT}:${hash}`, comment);

    // replace hash
    commentList.data[hashIndex] = hash;

    const pinKey = `${ObjectStoreKeys.OBJECT_ID}:${this.pin.id}`;
    await BrowserStorage.set(pinKey, this.pin);

    return hash;
  }
}
