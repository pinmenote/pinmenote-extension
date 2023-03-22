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
import React, { FunctionComponent } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { SyncData } from './sync-data';
import Typography from '@mui/material/Typography';

export const AccountDetailsComponent: FunctionComponent = () => {
  const handleLogout = async (): Promise<void> => {
    await BrowserApi.sendRuntimeMessage<undefined>({
      type: BusMessageType.POPUP_LOGOUT
    });
  };

  return (
    <div>
      <Typography align="center" fontSize="2em" fontWeight="bold">
        Authenticated
      </Typography>
      <div style={{ marginBottom: '10px' }}>
        <SyncData />
      </div>
      <div style={{ position: 'absolute', bottom: 0, width: 300 }}>
        <Button sx={{ width: '100%' }} style={{ marginBottom: 10 }} variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
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