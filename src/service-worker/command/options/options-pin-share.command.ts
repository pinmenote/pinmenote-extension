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
import { ApiSharePinCommand } from '../api/api-share-pin.command';
import { BusMessageType } from '@common/model/bus.model';
import { PinObject } from '@common/model/pin.model';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendRuntimeMessage } from '@common/message/runtime.message';
import ICommand = Pinmenote.Common.ICommand;
import ServerErrorDto = Pinmenote.Common.ServerErrorDto;
import ShareUrlDto = Pinmenote.Share.ShareUrlDto;

export class OptionsPinShareCommand implements ICommand<void> {
  constructor(private data: PinObject) {}
  async execute(): Promise<void> {
    try {
      const data = await new ApiSharePinCommand(this.data).execute();

      await sendRuntimeMessage<ShareUrlDto>({
        type: BusMessageType.OPTIONS_PIN_SHARE,
        data
      });
    } catch (e: unknown) {
      fnConsoleLog('OptionsPinShareCommand Error', e);
      const { error } = e as { error: ServerErrorDto };
      const data = error.code ? error : { code: -1, message: (e as Error).message };
      await sendRuntimeMessage<ServerErrorDto>({
        type: BusMessageType.POPUP_API_ERROR,
        data
      });
    }
  }
}
