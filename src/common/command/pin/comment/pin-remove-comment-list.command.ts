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
import { ObjDto } from '../../../model/obj/obj.dto';
import { ObjPinDto } from '../../../model/obj/obj-pin.dto';
import { PinRemoveCommentCommand } from './pin-remove-comment.command';
import { fnConsoleLog } from '../../../fn/fn-console';

export class PinRemoveCommentListCommand implements ICommand<Promise<void>> {
  constructor(private pin: ObjDto<ObjPinDto>) {}

  async execute(): Promise<void> {
    fnConsoleLog('PinRemoveCommentListCommand', this.pin.data.comments.data);
    for (const hash of this.pin.data.comments.data) {
      await new PinRemoveCommentCommand(this.pin, hash, false).execute();
    }
  }
}
