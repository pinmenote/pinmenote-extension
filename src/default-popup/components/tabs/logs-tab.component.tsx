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
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { LogManager } from '../../../common/popup/log.manager';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import Typography from '@mui/material/Typography';

export const LogsTabComponent: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = LogManager.logs;
    const key = TinyDispatcher.getInstance().addListener<string>(
      BusMessageType.POP_CONSOLE_LOG,
      (event, key, value) => {
        if (ref.current) ref.current.innerHTML = value;
      }
    );
    return () => {
      TinyDispatcher.getInstance().removeListener(BusMessageType.POP_CONSOLE_LOG, key);
    };
  }, []);

  const handleRemoveAllPins = async (): Promise<void> => {
    await BrowserApi.localStore.clear();
  };

  const handleClearLogs = () => {
    LogManager.clear();
  };
  return (
    <div style={{ height: '100%', margin: 5 }}>
      <Typography fontSize="2em">Debug</Typography>
      <div style={{ margin: 10 }}>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleRemoveAllPins}>
          Remove all pins
        </Button>
      </div>
      <div style={{ margin: 10 }}>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleClearLogs}>
          Clear logs
        </Button>
      </div>
      <Typography fontSize="1.5em" fontWeight="bold">
        Logs reverse
      </Typography>
      <div ref={ref} style={{ overflow: 'auto', height: 400, marginTop: 5 }}></div>
    </div>
  );
};
