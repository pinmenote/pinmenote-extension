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
import React, { FunctionComponent, ReactElement, useState } from 'react';
import { AccessTokenDto } from '../../../common/model/shared/token.dto';
import { AccountDetailsComponent } from '../account/account-details.component';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { LoginComponent } from '../account/login.component';
import { PopupTokenStore } from '../../store/popup-token.store';
import { TokenStorageSetCommand } from '../../../common/command/server/token/token-storage-set.command';
import { Verify2faComponent } from '../account/verify-2fa.component';

enum LoginEnum {
  LOGIN = 1,
  VERIFY_2FA,
  ACCOUNT
}

const getAccountComponent = (
  state: LoginEnum,
  loginSuccess: (data: AccessTokenDto) => void,
  logoutSuccess: () => void,
  verifyToken: string
): ReactElement | undefined => {
  switch (state) {
    case LoginEnum.LOGIN:
      return <LoginComponent loginSuccess={loginSuccess} />;
    case LoginEnum.VERIFY_2FA:
      return <Verify2faComponent loginSuccess={loginSuccess} verifyToken={verifyToken} />;
    case LoginEnum.ACCOUNT:
      return <AccountDetailsComponent logoutSuccess={logoutSuccess} />;
  }
  return undefined;
};

export const AccountTabComponent: FunctionComponent = () => {
  const [loginState, setLoginState] = useState<LoginEnum>(PopupTokenStore.token ? LoginEnum.ACCOUNT : LoginEnum.LOGIN);
  const [verifyToken, setVerifyToken] = useState<string>('');

  const loginSuccess = async (data: AccessTokenDto) => {
    if (data.token_type === 'GoogleAuthenticator') {
      setVerifyToken(data.access_token);
      setLoginState(LoginEnum.VERIFY_2FA);
    } else {
      await new TokenStorageSetCommand(data).execute();
      setVerifyToken('');
      setLoginState(LoginEnum.ACCOUNT);
      await PopupTokenStore.init();
      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_LOGIN_SUCCESS });
    }
  };

  const logoutSuccess = () => {
    setLoginState(LoginEnum.LOGIN);
  };

  const currentComponent = getAccountComponent(loginState, loginSuccess, logoutSuccess, verifyToken);
  return (
    <div>
      <div style={{ marginTop: 10 }}>{currentComponent}</div>
    </div>
  );
};
