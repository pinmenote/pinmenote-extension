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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { LogManager } from '../../../common/popup/log.manager';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

export const LogsTabComponent: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleRemoveAllPins = async (): Promise<void> => {
    await BrowserApi.localStore.clear();
  };

  const handleClearLogs = () => {
    LogManager.clear();
  };

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = LogManager.logs;
    const key = TinyEventDispatcher.addListener<string>(BusMessageType.POP_CONSOLE_LOG, (event, key, value) => {
      if (ref.current) ref.current.innerHTML = value;
    });
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POP_CONSOLE_LOG, key);
    };
  });
  return (
    <div style={{ height: '100%', margin: 5 }}>
      <div>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleRemoveAllPins}>
          Remove all pins
        </Button>
      </div>
      <div style={{ margin: 10 }}>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleClearLogs}>
          Clear logs
        </Button>
      </div>
      <Typography style={{ fontSize: '2em' }}>Logs</Typography>
      <div ref={ref} style={{ overflow: 'auto', height: 400, marginTop: 5 }}></div>
    </div>
  );
};
