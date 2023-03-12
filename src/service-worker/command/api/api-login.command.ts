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
import { AccessTokenDto, LoginDto, TokenDataDto, TokenUserDto } from '../../../common/model/shared/token.dto';
import { FetchService } from '../../service/fetch.service';
import { ICommand } from '../../../common/model/shared/common.dto';
import { TokenStorageSetCommand } from '../../../common/command/server/token/token-storage-set.command';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import jwtDecode from 'jwt-decode';

export class ApiLoginCommand implements ICommand<Promise<TokenUserDto>> {
  constructor(private data: LoginDto) {}
  async execute(): Promise<TokenUserDto> {
    fnConsoleLog('ApiLoginCommand->execute', environmentConfig.url.api);

    const resp = await FetchService.post<AccessTokenDto>(`${environmentConfig.url.api}/api/v1/auth/login`, this.data);

    fnConsoleLog('ApiLoginCommand->execute', resp);

    await new TokenStorageSetCommand(resp).execute();

    const tokenDataDto = jwtDecode<TokenDataDto>(resp.access_token);
    if (!tokenDataDto) throw new Error('No tokenData');

    return tokenDataDto.data;
  }
}
