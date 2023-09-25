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
import { TokenStorageRemoveCommand } from '../../../common/command/server/token/token-storage-remove.command';
import Typography from '@mui/material/Typography';
import jwtDecode from 'jwt-decode';
import { ServerQuotaResponse } from '../../../common/model/sync-server.model';
import { fnByteToGb } from '../../../common/fn/fn-byte-convert';

interface Props {
  logoutSuccess: () => void;
}

export const AccountDetailsComponent: FunctionComponent<Props> = (props) => {
  const [tokenData, setTokenData] = useState<TokenDataDto | undefined>();
  const [serverQuota, setServerQuota] = useState<ServerQuotaResponse>();
  const [responseError, setResponseError] = useState<ServerErrorDto | undefined>(undefined);

  useEffect(() => {
    LogManager.log(`AccountDetailsComponent init`);

    const dispatcher = TinyDispatcher.getInstance();
    let quotaKey: string | undefined = undefined;

    if (PopupTokenStore.token) {
      setTokenData(jwtDecode<TokenDataDto>(PopupTokenStore.token.access_token));
      quotaKey = dispatcher.addListener<ServerQuotaResponse>(
        BusMessageType.POPUP_SERVER_QUOTA,
        (event, key, value) => {
          LogManager.log(`${event} - ${JSON.stringify(value)}`);
          setServerQuota(value);
        },
        true
      );
      BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_SERVER_QUOTA })
        .then(() => {
          /* */
        })
        .catch(() => {
          /* */
        });
    }

    const loginSuccessKey = dispatcher.addListener(
      BusMessageType.POPUP_LOGIN_SUCCESS,
      async (event, key) => {
        await PopupTokenStore.init();
        if (PopupTokenStore.token) setTokenData(jwtDecode<TokenDataDto>(PopupTokenStore.token.access_token));
      },
      true
    );

    const logoutKey = dispatcher.addListener<FetchResponse<BoolDto | ServerErrorDto>>(
      BusMessageType.POPUP_LOGOUT,
      async (event, key, value) => {
        LogManager.log('POPUP_LOGOUT_RESPONSE');
        if (value.ok) {
          props.logoutSuccess();
        } else {
          setResponseError(value.data as ServerErrorDto);
        }
        await new TokenStorageRemoveCommand().execute();
        setTokenData(undefined);
      }
    );
    return () => {
      dispatcher.removeListener(BusMessageType.POPUP_LOGIN_SUCCESS, loginSuccessKey);
      dispatcher.removeListener(BusMessageType.POPUP_LOGOUT, logoutKey);
      if (quotaKey) dispatcher.removeListener(BusMessageType.POPUP_SERVER_QUOTA, quotaKey);
    };
  }, [props]);

  const handleLogout = async (): Promise<void> => {
    LogManager.log('AccountDetailsComponent->handleLogout');
    await BrowserApi.sendRuntimeMessage({
      type: BusMessageType.POPUP_LOGOUT
    });
  };

  return (
    <div>
      <div>
        <div>
          <Typography align="center" fontSize="1.5em" fontWeight="bold">
            Welcome {tokenData?.data.username}
          </Typography>
        </div>
        <div style={{ margin: 10 }}>
          <Typography fontSize="1.2em" fontWeight="bold">
            Account statistics{' '}
          </Typography>
          <Typography style={{ marginTop: 5 }} fontSize="1.2em">
            {fnByteToGb(serverQuota?.used)} GB of {fnByteToGb(serverQuota?.available)} GB disk space used
          </Typography>
          <Typography style={{ marginTop: 5 }} fontSize="1.2em">
            {serverQuota?.files || '0'} files and {serverQuota?.documents || '0'} documents archived
          </Typography>
        </div>
      </div>

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
