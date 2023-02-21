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
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import { LogManager } from '../../../common/popup/log.manager';
import { RegisterFormData } from '../../../common/model/auth.model';
import { ServerErrorDto } from '../../../common/model/shared/common.dto';
import { StyledInput } from '../../../common/components/react/styled.input';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { TokenUserDto } from '../../../common/model/shared/token.dto';
import Typography from '@mui/material/Typography';
import { environmentConfig } from '../../../common/environment';

const inputBorder = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: 5,
  borderRadius: 5,
  margin: 10
};

function getWebsiteUrl(uri: string): string {
  return `${environmentConfig.url.web}${uri}`;
}

export const RegisterComponent: FunctionComponent = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [termsVersion, setTermsVersion] = useState<string | undefined>(undefined);
  const [responseError, setResponseError] = useState<ServerErrorDto | undefined>(undefined);
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);

  useEffect(() => {
    const registerKey = TinyEventDispatcher.addListener<TokenUserDto>(
      BusMessageType.POPUP_REGISTER,
      (event, key, value) => {
        setRegisterSuccess(true);
        LogManager.log(`POPUP_REGISTER ${JSON.stringify(value)}`);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_REGISTER, registerKey);
    };
  });

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleRegisterClick = async () => {
    if (!termsVersion) {
      setResponseError({
        code: -1000,
        message: 'Accept Terms of use and Privacy Policy before creating account'
      });
    } else {
      await BrowserApi.sendRuntimeMessage<RegisterFormData>({
        type: BusMessageType.POPUP_REGISTER,
        data: { username, email, termsVersion }
      });
    }
  };

  const handleLoginClick = () => {
    TinyEventDispatcher.dispatch(BusMessageType.POP_LOGIN_CLICK, undefined);
  };

  const handleAccountClick = () => {
    TinyEventDispatcher.dispatch(BusMessageType.POP_ACCOUNT_CLICK, undefined);
  };

  const borderStyle =
    responseError && responseError?.code !== -1000
      ? `1px solid ${COLOR_DEFAULT_RED}`
      : `1px solid ${COLOR_DEFAULT_GREY}`;
  const acceptedColor = responseError?.code === -1000 ? COLOR_DEFAULT_RED : undefined;

  return (
    <div>
      <div
        style={{
          display: registerSuccess ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300
        }}
      >
        <div>
          <Typography style={{ fontSize: '24pt' }}>
            Thank you for registering, check your inbox to verify email
          </Typography>
        </div>
        <div>
          <Button sx={{ width: '100%' }} variant="outlined" onClick={handleAccountClick}>
            Go To Account
          </Button>
        </div>
      </div>
      <div style={{ display: registerSuccess ? 'none' : 'flex', flexDirection: 'column', maxHeight: 300 }}>
        <label style={{ fontSize: '2em', marginTop: 20, textAlign: 'center' }}>Register</label>
        <div style={{ border: borderStyle, ...inputBorder }}>
          <StyledInput onChange={handleUsernameChange} value={username} placeholder="username" />
        </div>
        <div style={{ ...inputBorder, marginTop: 0, border: borderStyle }}>
          <StyledInput onChange={handleEmailChange} value={email} placeholder="email" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            checked={!!termsVersion}
            onClick={() => setTermsVersion(termsVersion ? undefined : environmentConfig.tosVersion)}
            sx={{ color: acceptedColor }}
          ></Checkbox>
          <Typography style={{ fontSize: '9pt' }}>
            I agree to{' '}
            <Link target="_blank" href={getWebsiteUrl('/terms-of-use')}>
              Terms of use
            </Link>{' '}
            and{' '}
            <Link target="_blank" href={getWebsiteUrl('/privacy-policy')}>
              Privacy Policy
            </Link>
          </Typography>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
          <Button sx={{ width: '100%' }} variant="outlined" onClick={handleRegisterClick}>
            Register
          </Button>
        </div>
        <div style={{ margin: 10 }}>
          <Typography style={{ fontSize: '8pt', color: COLOR_DEFAULT_RED }}>
            {responseError?.code} {responseError?.message}
          </Typography>
        </div>
      </div>
      <Typography align="center" style={{ marginTop: 20 }}>
        <span>Already have account ?</span>
        <Link style={{ marginLeft: 10 }} href="#" onClick={handleLoginClick}>
          Login
        </Link>
      </Typography>
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
