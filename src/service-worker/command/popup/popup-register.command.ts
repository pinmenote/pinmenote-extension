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
import { ApiRegisterCommand } from '../api/api-register.command';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { RegisterFormData } from '../../../common/model/auth.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;
import TokenUserDto = Pinmenote.Account.TokenUserDto;
import ServerErrorDto = Pinmenote.Common.ServerErrorDto;

export class PopupRegisterCommand implements ICommand<void> {
  constructor(private data: RegisterFormData) {}
  async execute(): Promise<void> {
    try {
      const data = await new ApiRegisterCommand(this.data).execute();

      await BrowserApi.sendRuntimeMessage<TokenUserDto>({
        type: BusMessageType.POPUP_REGISTER,
        data
      });
    } catch (e: unknown) {
      fnConsoleLog('Register Error', e);
      const { error } = e as { error: ServerErrorDto };
      const data = error.code ? error : { code: -1, message: (e as Error).message };
      await BrowserApi.sendRuntimeMessage<ServerErrorDto>({
        type: BusMessageType.POPUP_API_ERROR,
        data
      });
    }
  }
}
