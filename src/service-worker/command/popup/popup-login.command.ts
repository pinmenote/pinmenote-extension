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
import { LoginDto, TokenUserDto } from '../../../common/model/shared/token.dto';
import { ApiLoginCommand } from '../api/api-login.command';
import { ApiStore } from '../../store/api.store';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class PopupLoginCommand implements ICommand<void> {
  constructor(private data: LoginDto) {}

  async execute(): Promise<void> {
    try {
      await ApiStore.clearToken();

      const data = await new ApiLoginCommand(this.data).execute();

      await BrowserApi.sendRuntimeMessage<TokenUserDto>({
        type: BusMessageType.POPUP_LOGIN,
        data
      });
    } catch (e) {
      fnConsoleLog('Error', e);
    }
  }
}
