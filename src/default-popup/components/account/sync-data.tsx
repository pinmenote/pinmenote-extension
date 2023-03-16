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
import React, { FunctionComponent, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const SyncData: FunctionComponent = () => {
  const [lastSync, setLastSync] = useState<string>('');

  const handleSyncNotes = async (): Promise<void> => {
    await BrowserApi.sendRuntimeMessage<undefined>({
      type: BusMessageType.POPUP_SYNC_DATA
    });
  };

  const handleClearStorage = async (): Promise<void> => {
    await BrowserApi.sendRuntimeMessage<undefined>({
      type: BusMessageType.POPUP_SYNC_DATA_CLEAR
    });
  };

  return (
    <div>
      <div style={{ margin: 10 }}>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleSyncNotes}>
          Synchronize Data
        </Button>
      </div>
      <div style={{ margin: 10 }}>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleClearStorage}>
          Clear storage
        </Button>
      </div>
      <Typography fontSize="0.9em" style={{ margin: '10px' }}>
        {lastSync}
      </Typography>
    </div>
  );
};
