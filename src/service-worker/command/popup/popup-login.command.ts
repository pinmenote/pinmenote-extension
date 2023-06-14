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
import { AccessTokenDto, LoginDto } from '../../../common/model/shared/token.dto';
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { ApiLoginCommand } from '../api/api-login.command';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { FetchResponse } from '@pinmenote/fetch-service';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class PopupLoginCommand implements ICommand<void> {
  constructor(private data: LoginDto) {}

  async execute(): Promise<void> {
    fnConsoleLog('PopupLoginCommand->execute');

    const data = await new ApiLoginCommand(this.data).execute();

    await BrowserApi.sendRuntimeMessage<FetchResponse<AccessTokenDto | ServerErrorDto>>({
      type: BusMessageType.POPUP_LOGIN,
      data
    });
  }
}
