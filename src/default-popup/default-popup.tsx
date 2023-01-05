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
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Box, Tab, Tabs } from '@mui/material';
import React, { ReactElement, useState } from 'react';
import { AccountTabComponent } from './components/tabs/account.tab.component';
import { BusMessageType } from '../common/model/bus.model';
import { LogManager } from '../common/popup/log.manager';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import { LogsTabComponent } from './components/tabs/logs.tab.component';
import PersonIcon from '@mui/icons-material/Person';
import { PinTabComponent } from './components/tabs/pin.tab.component';
import { PopupMessageHandler } from './popup-message.handler';
import PushPinIcon from '@mui/icons-material/PushPin';
import { createRoot } from 'react-dom/client';
import { environmentConfig } from '../common/environment';
import { fnConsoleLog } from '../common/fn/console.fn';
import { sendRuntimeMessage } from '../common/message/runtime.message';

enum PanelEnum {
  PIN,
  ACCOUNT,
  LOGS
}

const getCurrentPanel = (selectedPanel: PanelEnum): ReactElement | undefined => {
  switch (selectedPanel) {
    case PanelEnum.PIN:
      return <PinTabComponent />;
    case PanelEnum.ACCOUNT:
      return <AccountTabComponent />;
    case PanelEnum.LOGS:
      return <LogsTabComponent />;
  }
  return undefined;
};

const App: React.FC = () => {
  const [selectedPanel, setSelectedPanel] = useState<PanelEnum>(PanelEnum.PIN);

  const handleChange = (event: React.SyntheticEvent, newValue: PanelEnum) => {
    setSelectedPanel(newValue);
    if (newValue === PanelEnum.ACCOUNT) {
      sendRuntimeMessage<void>({
        type: BusMessageType.POPUP_ACCESS_TOKEN
      })
        .then(() => fnConsoleLog('ack'))
        .catch(() => fnConsoleLog('err'));
    }
  };

  // Show logs panel only on development environment
  let logsTab: any = '';
  if (!environmentConfig.isProduction) {
    logsTab = <Tab icon={<LogoDevIcon />} tabIndex={3} />;
  }

  const panel = getCurrentPanel(selectedPanel);

  return (
    <div
      style={{
        minWidth: 300,
        maxWidth: 300,
        minHeight: 600,
        maxHeight: 600,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedPanel} onChange={handleChange}>
          <Tab icon={<PushPinIcon />} />
          <Tab icon={<PersonIcon />} />
          {logsTab}
        </Tabs>
      </Box>
      {panel}
    </div>
  );
};
const el = document.getElementById('root');
if (el) {
  const root = createRoot(el);
  root.render(<App />);
}
try {
  PopupMessageHandler.init();
} catch (e) {
  LogManager.log(`Error ${JSON.stringify(e)}`);
}
