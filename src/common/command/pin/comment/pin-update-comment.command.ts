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
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjAddHashtagsCommand } from '../../obj/hashtag/obj-add-hashtags.command';
import { ObjCommentDto } from '../../../model/obj/obj-comment.dto';
import { ObjDto } from '../../../model/obj/obj.dto';
import { ObjPinDto } from '../../../model/obj/obj-pin.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { fnConsoleLog } from '../../../fn/fn-console';
import { fnSha256 } from '../../../fn/fn-sha256';

export class PinUpdateCommentCommand implements ICommand<Promise<string | undefined>> {
  constructor(private pin: ObjDto<ObjPinDto>, private comment: ObjCommentDto, private value: string) {}

  async execute(): Promise<string | undefined> {
    await new ObjAddHashtagsCommand(this.pin.id, this.value).execute();

    const commentList = this.pin.data.comments;
    const hashIndex = commentList.data.indexOf(this.comment.hash);
    if (hashIndex === -1) return;

    const dt = Date.now();
    const hash = fnSha256(`${this.value}-${dt}`);
    fnConsoleLog('PinUpdateCommentCommand', hash, 'old', this.comment.hash);

    this.comment.value = this.value;
    this.comment.updatedAt = dt;
    this.comment.prev = this.comment.hash;
    this.comment.hash = hash;

    await BrowserStorageWrapper.set(`${ObjectStoreKeys.PIN_COMMENT}:${hash}`, this.comment);

    // replace hash
    commentList.data[hashIndex] = hash;

    const pinKey = `${ObjectStoreKeys.PIN_ID}:${this.pin.id}`;
    await BrowserStorageWrapper.set(pinKey, this.pin);

    return hash;
  }
}
