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
import { COLOR_DEFAULT_GREY, COLOR_DEFAULT_RED } from '../../../common/components/colors';
import { LoginDto, TokenUserDto } from '../../../common/model/shared/token.dto';
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { LogManager } from '../../../common/popup/log.manager';
import { ServerErrorDto } from '../../../common/model/shared/common.dto';
import { StyledInput } from '../../../common/components/react/styled.input';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

export const LoginComponent: FunctionComponent = () => {
  const [email, setEmail] = useState<string>('');
  const [responseError, setResponseError] = useState<ServerErrorDto | undefined>(undefined);

  useEffect(() => {
    const loginKey = TinyEventDispatcher.addListener<TokenUserDto>(BusMessageType.POPUP_LOGIN, (event, key, value) => {
      TinyEventDispatcher.dispatch<TokenUserDto>(BusMessageType.POPUP_ACCESS_TOKEN, value);
      LogManager.log(`POPUP_LOGIN ${JSON.stringify(value)}`);
    });
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_LOGIN, loginKey);
    };
  });

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleLoginClick = async (): Promise<void> => {
    setResponseError(undefined);
    await BrowserApi.sendRuntimeMessage<LoginDto>({
      type: BusMessageType.POPUP_LOGIN,
      data: { email, signature: '' }
    });
  };

  // Advanced options

  const handleRegisterClick = () => {
    TinyEventDispatcher.dispatch(BusMessageType.POP_REGISTER_CLICK, {});
  };

  const borderStyle = responseError ? `1px solid ${COLOR_DEFAULT_RED}` : `1px solid ${COLOR_DEFAULT_GREY}`;
  const advancedDescription = `Don't have account ?`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 300 }}>
      <Typography align="center" fontSize="2em" style={{ marginTop: 20 }}>
        Login
      </Typography>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          border: borderStyle,
          padding: 5,
          borderRadius: 5,
          margin: 10
        }}
      >
        <StyledInput onChange={handleEmailChange} value={email} placeholder="email" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleLoginClick}>
          Login
        </Button>
      </div>
      <Typography align="center" style={{ marginTop: 20 }}>
        <span>{advancedDescription}</span>
        <Link style={{ marginLeft: 10 }} href="#" onClick={handleRegisterClick}>
          Register
        </Link>
      </Typography>
      <div style={{ margin: 10 }}>
        <Typography style={{ fontSize: '8pt', color: COLOR_DEFAULT_RED }}>
          {responseError?.code} {responseError?.message}
        </Typography>
      </div>
      {/* ADVANCED OPTIONS */}
      <div style={{ position: 'absolute', bottom: 0, width: 300 }}>
        <Button
          sx={{ width: '100%' }}
          style={{ marginBottom: 10 }}
          variant="outlined"
          onClick={() => BrowserApi.openOptionsPage('#settings')}
        >
          Advanced options
        </Button>
      </div>
    </div>
  );
};
