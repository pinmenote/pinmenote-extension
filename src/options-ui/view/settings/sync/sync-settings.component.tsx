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
import React, { FunctionComponent, useEffect } from 'react';
import { BusMessageType } from '@common/model/bus.model';
import { Button } from '@mui/material';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendRuntimeMessage } from '@common/message/runtime.message';

export const SyncSettingsComponent: FunctionComponent = () => {
  useEffect(() => {
    const syncKey = TinyEventDispatcher.addListener<any>(
      BusMessageType.OPTIONS_SYNCHRONIZE_DATA,
      (event, key, value) => {
        fnConsoleLog('RESULT', value);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_SYNCHRONIZE_DATA, syncKey);
    };
  });

  const handleSynchronize = async () => {
    await sendRuntimeMessage({ type: BusMessageType.OPTIONS_SYNCHRONIZE_DATA });
  };

  const handleClear = async () => {
    await sendRuntimeMessage({ type: BusMessageType.OPTIONS_SYNCHRONIZE_CLEAR });
  };

  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        synchronization
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 20 }}>
        <Typography fontSize="2em" style={{ marginRight: 10 }}>
          last time
        </Typography>
        <Button variant="outlined" onClick={handleSynchronize} style={{ marginRight: 10 }}>
          Synchronize
        </Button>
        <Button variant="outlined" onClick={handleClear}>
          Clear
        </Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Typography fontSize="2em" style={{ marginRight: 10 }}>
          quota
        </Typography>
        <Typography fontSize="2em" style={{ marginRight: 10 }}>
          1000MB
        </Typography>
      </div>
    </div>
  );
};
