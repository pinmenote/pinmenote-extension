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
import { AccessTokenDto } from '../../common/model/shared/token.dto';
import { TokenStorageGetCommand } from '../../common/command/server/token/token-storage-get.command';

export class PopupTokenStore {
  private static tokenValue: AccessTokenDto | undefined;

  static init = async () => {
    this.tokenValue = await new TokenStorageGetCommand().execute();
  };

  static get token(): AccessTokenDto | undefined {
    return this.tokenValue;
  }
}
