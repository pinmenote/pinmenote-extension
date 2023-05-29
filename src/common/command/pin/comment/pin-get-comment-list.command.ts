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
import { ICommand } from '../../../model/shared/common.dto';
import { ObjCommentDto } from '../../../model/obj/obj-comment.dto';
import { PinGetCommentCommand } from './pin-get-comment.command';
import { fnConsoleLog } from '../../../fn/fn-console';

export class PinGetCommentListCommand implements ICommand<Promise<ObjCommentDto[]>> {
  constructor(private hashList: string[]) {}

  async execute(): Promise<ObjCommentDto[]> {
    fnConsoleLog('PinGetCommentListCommand', this.hashList);
    const hashList = this.hashList.concat();
    const comments: ObjCommentDto[] = [];
    while (hashList.length > 0) {
      const hash = hashList[0];
      const comment = await new PinGetCommentCommand(hash).execute();
      if (comment) comments.push(comment);
      if (comment?.prev) hashList.push(comment.prev);
    }
    return comments;
  }
}
