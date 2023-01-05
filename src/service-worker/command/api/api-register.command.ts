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
import { CryptoGenerateKeyPairCommand } from '../crypto/crypto-generate-key-pair.command';
import { FetchService } from '../../service/fetch.service';
import { RegisterFormData } from '../../../common/model/auth.model';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import AccessTokenDto = Pinmenote.Auth.AccessTokenDto;
import ICommand = Pinmenote.Common.ICommand;
import RegisterDto = Pinmenote.Auth.RegisterDto;
import TokenUserDto = Pinmenote.Auth.TokenUserDto;

export class ApiRegisterCommand implements ICommand<Promise<TokenUserDto>> {
  constructor(private formData: RegisterFormData) {}
  async execute(): Promise<TokenUserDto> {
    // Generate cryptographic keys and send public key to server
    const keyData = await new CryptoGenerateKeyPairCommand(this.formData.username, this.formData.email).execute();
    const data: RegisterDto = {
      email: this.formData.email,
      username: this.formData.username,
      acceptedVersion: this.formData.acceptedVersion,
      publicKey: keyData.publicKey
    };

    const resp = await FetchService.post<AccessTokenDto>(`${environmentConfig.apiUrl}/api/v1/register`, data);
    fnConsoleLog('WorkerApiManager->register', resp);
    await ApiStore.setAccessToken(resp);

    const tokenData = await ApiStore.getTokenData();
    if (!tokenData) throw new Error('No tokenData');

    return tokenData.data;
  }
}
