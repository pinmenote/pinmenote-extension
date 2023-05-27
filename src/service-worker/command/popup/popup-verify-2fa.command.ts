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
import { AccessTokenDto, VerifyTokenDto } from '../../../common/model/shared/token.dto';
import { ApiVerify2faCommand } from '../api/api-verify-2fa.command';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { FetchResponse } from '../../../common/model/api.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class PopupVerify2faCommand implements ICommand<void> {
  constructor(private data: VerifyTokenDto) {}

  async execute(): Promise<void> {
    fnConsoleLog('PopupVerify2faCommand->execute');

    const data = await new ApiVerify2faCommand(this.data).execute();

    await BrowserApi.sendRuntimeMessage<FetchResponse<AccessTokenDto>>({
      type: BusMessageType.POPUP_VERIFY_2FA,
      data
    });
  }
}
