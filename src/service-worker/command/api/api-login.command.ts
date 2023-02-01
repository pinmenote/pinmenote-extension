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
import { ApiStore } from '../../store/api.store';
import { CryptoSignCommand } from '../crypto/crypto-sign.command';
import { FetchService } from '../../service/fetch.service';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import AccessTokenDto = Pinmenote.Account.AccessTokenDto;
import ICommand = Pinmenote.Common.ICommand;
import LoginDto = Pinmenote.Account.LoginDto;
import TokenUserDto = Pinmenote.Account.TokenUserDto;

export class ApiLoginCommand implements ICommand<Promise<TokenUserDto>> {
  constructor(private data: LoginDto) {}
  async execute(): Promise<TokenUserDto> {
    this.data.signature = await new CryptoSignCommand(this.data.email).execute();

    const resp = await FetchService.post<AccessTokenDto>(`${environmentConfig.apiUrl}/api/v1/login`, this.data);
    fnConsoleLog('WorkerApiManager->login', resp);

    await ApiStore.setAccessToken(resp);
    const tokenData = await ApiStore.getTokenData();
    if (!tokenData) throw new Error('No tokenData');

    return tokenData.data;
  }
}
