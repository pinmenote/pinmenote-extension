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
import { BoolDto, ServerErrorDto } from '../../../common/model/shared/common.dto';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { COLOR_DEFAULT_RED } from '../../../common/components/colors';
import { FetchResponse } from '@pinmenote/fetch-service';
import { LogManager } from '../../../common/popup/log.manager';
import { PopupTokenStore } from '../../store/popup-token.store';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { TokenDataDto } from '../../../common/model/shared/token.dto';
import Typography from '@mui/material/Typography';
import jwtDecode from 'jwt-decode';

interface AccountDetailsComponentProps {
  logoutSuccess: () => void;
}

export const AccountDetailsComponent: FunctionComponent<AccountDetailsComponentProps> = ({ logoutSuccess }) => {
  const [tokenData, setTokenData] = useState<TokenDataDto | undefined>();
  const [responseError, setResponseError] = useState<ServerErrorDto | undefined>(undefined);

  useEffect(() => {
    LogManager.log(`AccountDetailsComponent init`);
    if (PopupTokenStore.token) {
      setTokenData(jwtDecode<TokenDataDto>(PopupTokenStore.token.access_token));
    }
    const loginSuccessKey = TinyDispatcher.addListener(
      BusMessageType.POPUP_LOGIN_SUCCESS,
      async (event, key, value) => {
        TinyDispatcher.removeListener(event, key);
        await PopupTokenStore.init();
        if (PopupTokenStore.token) setTokenData(jwtDecode<TokenDataDto>(PopupTokenStore.token.access_token));
        // TODO upload keys ???
        LogManager.log(`${JSON.stringify(value)}`);
      }
    );
    const logoutKey = TinyDispatcher.addListener<FetchResponse<BoolDto | ServerErrorDto>>(
      BusMessageType.POPUP_LOGOUT,
      (event, key, value) => {
        LogManager.log('POPUP_LOGOUT_RESPONSE');
        if (value.ok) {
          logoutSuccess();
        } else {
          setResponseError(value.data as ServerErrorDto);
        }
      }
    );
    return () => {
      TinyDispatcher.removeListener(BusMessageType.POPUP_LOGIN_SUCCESS, loginSuccessKey);
      TinyDispatcher.removeListener(BusMessageType.POPUP_LOGOUT, logoutKey);
    };
  }, []);

  const handleLogout = async (): Promise<void> => {
    LogManager.log('AccountDetailsComponent->handleLogout');
    await BrowserApi.sendRuntimeMessage<undefined>({
      type: BusMessageType.POPUP_LOGOUT
    });
  };

  return (
    <div>
      <Typography align="center" fontSize="1.5em" fontWeight="bold">
        Welcome {tokenData?.data.username}
      </Typography>
      <div style={{ position: 'absolute', bottom: 0, width: 300 }}>
        <div style={{ margin: 10 }}>
          <Typography style={{ fontSize: '8pt', color: COLOR_DEFAULT_RED }}>
            {responseError?.code} {responseError?.message}
          </Typography>
        </div>
        <Button sx={{ width: '100%' }} style={{ marginBottom: 10 }} variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
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
