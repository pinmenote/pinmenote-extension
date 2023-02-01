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
import React, { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { AccountComponent } from '../account/account.component';
import { BusMessageType } from '../../../common/model/bus.model';
import { LogManager } from '../../../common/popup/log.manager';
import { LoginComponent } from '../account/login.component';
import { RegisterComponent } from '../account/register.component';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import AccessTokenDto = Pinmenote.Account.AccessTokenDto;

enum LoginEnum {
  LOGIN = 1,
  REGISTER,
  ACCOUNT
}

const getAccountComponent = (state: LoginEnum): ReactElement | undefined => {
  switch (state) {
    case LoginEnum.LOGIN:
      return <LoginComponent />;
    case LoginEnum.REGISTER:
      return <RegisterComponent />;
    case LoginEnum.ACCOUNT:
      return <AccountComponent />;
  }
  return undefined;
};

export const AccountTabComponent: FunctionComponent = () => {
  const [loginState, setLoginState] = useState<LoginEnum>(LoginEnum.LOGIN);

  useEffect(() => {
    const loginClickKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.POP_LOGIN_CLICK, () => {
      setLoginState(LoginEnum.LOGIN);
    });
    const registerClickKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.POP_REGISTER_CLICK, () => {
      setLoginState(LoginEnum.REGISTER);
    });
    const accountClickKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.POP_ACCOUNT_CLICK, () => {
      setLoginState(LoginEnum.ACCOUNT);
    });
    const logoutKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.POPUP_LOGOUT, () => {
      setLoginState(LoginEnum.LOGIN);
    });
    const accessTokenKey = TinyEventDispatcher.addListener<AccessTokenDto | undefined>(
      BusMessageType.POPUP_ACCESS_TOKEN,
      (event, key, value) => {
        LogManager.log(`POPUP_ACCESS_TOKEN ${JSON.stringify(value)}`);
        if (value) {
          setLoginState(LoginEnum.ACCOUNT);
        } else {
          setLoginState(LoginEnum.LOGIN);
        }
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POP_LOGIN_CLICK, loginClickKey);
      TinyEventDispatcher.removeListener(BusMessageType.POP_REGISTER_CLICK, registerClickKey);
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_ACCESS_TOKEN, accessTokenKey);
      TinyEventDispatcher.removeListener(BusMessageType.POP_ACCOUNT_CLICK, accountClickKey);
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_LOGOUT, logoutKey);
    };
  });
  const currentComponent = getAccountComponent(loginState);
  return (
    <div>
      <div style={{ marginTop: 10 }}>{currentComponent}</div>
    </div>
  );
};
