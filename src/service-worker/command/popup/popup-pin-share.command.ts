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
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { ObjDto, ObjShareDto } from '../../../common/model/obj/obj.dto';
import { ApiSharePinCommand } from '../api/api-share-pin.command';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class PopupPinShareCommand implements ICommand<void> {
  constructor(private data: ObjDto<ObjPagePinDto>) {}
  async execute(): Promise<void> {
    try {
      const data = await new ApiSharePinCommand(this.data).execute();

      await BrowserApi.sendRuntimeMessage<ObjShareDto>({
        type: BusMessageType.POPUP_PIN_SHARE,
        data
      });
    } catch (e: unknown) {
      fnConsoleLog('PopupPinShareCommand Error', e);
      const { error } = e as { error: ServerErrorDto };
      const data = error.code ? error : { code: -1, message: (e as Error).message };
      await BrowserApi.sendRuntimeMessage<ServerErrorDto>({
        type: BusMessageType.POPUP_API_ERROR,
        data
      });
    }
  }
}
