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
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { ObjHashtagStore } from '../../../common/store/obj-hashtag.store';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

class MenuStore {
  private static sent = false;
  static hashList: string[] = [];

  static dispatchInit(): void {
    if (this.sent) return;
    TinyEventDispatcher.dispatch<undefined>(BusMessageType.OPT_GET_LEFT_MENU_DATA, undefined);
    this.sent = true;
  }

  static fetchData = async (): Promise<void> => {
    // hash list
    const hashList = await ObjHashtagStore.getHashtagList();
    MenuStore.hashList = hashList.sort();
  };
}
export const LeftSideMenu: FunctionComponent = () => {
  const [hashList, setHashList] = useState<ReactNode[]>(MenuStore.hashList);

  useEffect(() => {
    const dataKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.OPT_GET_LEFT_MENU_DATA, async () => {
      await MenuStore.fetchData();
      setHashList(MenuStore.hashList.map((h) => <Typography key={`hash-${h}`}>{h}</Typography>));
    });
    MenuStore.dispatchInit();
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_GET_LEFT_MENU_DATA, dataKey);
    };
  });

  const handleSettingsClick = () => {
    window.location.hash = 'settings';
  };

  return (
    <div style={{ minWidth: 250, maxWidth: 250, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column' }}>
        <div style={{ display: 'flex', marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
          <img src={BrowserApi.logoIconPath} width="32" height="32" style={{ marginRight: 10 }} />
          <Typography fontSize="2em" align="center">
            pinmenote
          </Typography>
        </div>
        <Divider style={{ marginTop: 5 }} />
      </div>
      <div style={{ height: '100%', marginLeft: 10, marginTop: 10 }}>
        <Typography align="center" fontSize="1.5em" fontWeight="bold">
          tags
        </Typography>
        <div style={{ overflow: 'auto' }}>{hashList}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', margin: 5, marginBottom: 20 }}>
          <Button sx={{ width: '100%' }} variant="outlined" onClick={handleSettingsClick}>
            settings
          </Button>
        </div>
      </div>
    </div>
  );
};
