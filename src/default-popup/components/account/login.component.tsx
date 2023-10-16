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
import { COLOR_DEFAULT_BORDER, COLOR_DEFAULT_RED, DEFAULT_BORDER_RADIUS } from '../../../common/components/colors';
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { FetchResponse } from '@pinmenote/fetch-service';
import Link from '@mui/material/Link';
import { LogManager } from '../../../common/popup/log.manager';
import { ServerErrorDto } from '../../../common/model/shared/common.dto';
import { StyledInput } from '../../../common/components/react/styled.input';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import Typography from '@mui/material/Typography';
import { environmentConfig } from '../../../common/environment';

const inputContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: 5,
  borderRadius: DEFAULT_BORDER_RADIUS,
  margin: '5px 10px 5px 10px'
};

function getWebsiteUrl(uri: string): string {
  return `${environmentConfig.defaultServer}${uri}`;
}

interface Props {
  loginSuccess: (res: AccessTokenDto) => void;
}

export const LoginComponent: FunctionComponent<Props> = ({ loginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [responseError, setResponseError] = useState<ServerErrorDto | undefined>(undefined);

  useEffect(() => {
    const loginKey = TinyDispatcher.getInstance().addListener<FetchResponse<AccessTokenDto>>(
      BusMessageType.POPUP_LOGIN,
      (event, key, value) => {
        LogManager.log(`POPUP_LOGIN: ${JSON.stringify(value)}`);
        if (value.ok) {
          loginSuccess(value.data);
        } else {
          setResponseError(value.data as any as ServerErrorDto);
        }
      }
    );
    return () => {
      TinyDispatcher.getInstance().removeListener(BusMessageType.POPUP_LOGIN, loginKey);
    };
  }, []);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleLoginClick = async (): Promise<void> => {
    setResponseError(undefined);
    LogManager.log('LoginComponent->handleLoginClick');
    await BrowserApi.sendRuntimeMessage<LoginDto>({
      type: BusMessageType.POPUP_LOGIN,
      data: { email, password, source: 'EXTENSION' }
    });
  };

  // Advanced options
  const borderStyle = responseError ? `1px solid ${COLOR_DEFAULT_RED}` : COLOR_DEFAULT_BORDER;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 300 }}>
      <Typography align="center" fontSize="2em" style={{ marginTop: 20 }}>
        Login
      </Typography>
      <div style={{ border: borderStyle, ...inputContainerStyle }}>
        <StyledInput onChange={handleEmailChange} value={email} placeholder="email" />
      </div>
      <div style={{ border: borderStyle, ...inputContainerStyle }}>
        <StyledInput onChange={handlePasswordChange} value={password} type="password" placeholder="password" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleLoginClick}>
          Login
        </Button>
      </div>
      <Typography align="center" style={{ marginTop: 20 }}>
        <Link target="_blank" href={getWebsiteUrl('/pricing')}>
          Subscribe to <b>Premium</b> Account
        </Link>
      </Typography>
      <div style={{ margin: 10 }}>
        <Typography style={{ fontSize: '8pt', color: COLOR_DEFAULT_RED }}>
          {responseError?.code} {responseError?.message}
        </Typography>
      </div>
      {/* Settings */}
      <div style={{ position: 'absolute', bottom: 0, width: 300 }}>
        <Button
          sx={{ width: '100%' }}
          style={{ marginBottom: 10 }}
          variant="outlined"
          onClick={() => BrowserApi.openOptionsPage('#settings')}
        >
          Settings
        </Button>
      </div>
    </div>
  );
};
