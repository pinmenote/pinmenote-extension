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
import { ObjCommentDto, ObjPinDto } from '../../../model/obj/obj-pin.dto';
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjDto } from '../../../model/obj/obj.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { PinGetCommentCommand } from './pin-get-comment.command';
import { fnConsoleLog } from '../../../fn/fn-console';

export class PinRemoveCommentCommand implements ICommand<Promise<void>> {
  constructor(private pin: ObjDto<ObjPinDto>, private hash: string, private updatePin = true) {}

  async execute(): Promise<void> {
    fnConsoleLog('PinRemoveCommentCommand', this.hash);
    const commentList = this.pin.data.comments;
    const hashIndex = commentList.data.indexOf(this.hash);
    if (hashIndex === -1) return;

    const comment = await new PinGetCommentCommand(this.hash).execute();
    if (!comment) return;
    let prev = comment.prev;

    while (prev !== undefined) {
      const prevKey = `${ObjectStoreKeys.PIN_COMMENT}:${prev}`;
      const prevComment = await BrowserStorageWrapper.get<ObjCommentDto | undefined>(prevKey);
      fnConsoleLog('PinRemoveCommentCommand->prev', prev);
      if (prevComment) {
        prev = prevComment.prev;
        await BrowserStorageWrapper.remove(prevKey);
      } else {
        break;
      }
    }

    if (this.updatePin) {
      commentList.data.splice(hashIndex, 1);

      await BrowserStorageWrapper.remove(`${ObjectStoreKeys.PIN_COMMENT}:${comment.hash}`);

      const pinKey = `${ObjectStoreKeys.PIN_ID}:${this.pin.id}`;
      await BrowserStorageWrapper.set(pinKey, this.pin);
    }
  }
}
