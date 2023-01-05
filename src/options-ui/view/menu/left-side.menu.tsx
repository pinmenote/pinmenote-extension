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
import { Button, Divider } from '@mui/material';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { PinBoardStore } from '../store/pin-board.store';
import { PinHashtagStore } from '../../../common/store/pin-hashtag.store';
import { PinHrefOriginStore } from '../../../common/store/pin-href-origin.store';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

class MenuStore {
  static readonly ALL_URLS = '<all_urls>';
  private static sent = false;

  static urlList: string[] = [];
  static hashList: string[] = [];

  static dispatchInit(): void {
    if (this.sent) return;
    TinyEventDispatcher.dispatch<undefined>(BusMessageType.OPT_GET_LEFT_MENU_DATA, undefined);
    this.sent = true;
  }

  static fetchData = async (): Promise<void> => {
    // url list
    const urlList = await PinHrefOriginStore.getOriginUrls();
    this.urlList = urlList.sort();
    urlList.unshift(MenuStore.ALL_URLS);

    // hash list
    const hashList = await PinHashtagStore.getHashtagList();
    MenuStore.hashList = hashList.sort();
  };
}

interface MenuLinkItemProps {
  url: string;
}

export const MenuLinkItem: FunctionComponent<MenuLinkItemProps> = ({ url }) => {
  const handleClick = async () => {
    PinBoardStore.clearSearch();
    if (url === MenuStore.ALL_URLS) {
      await PinBoardStore.sendRange();
    } else {
      PinBoardStore.setSearch(url);
      await PinBoardStore.sendSearch();
    }
  };

  return (
    <div style={{ marginLeft: 5, marginTop: 10 }}>
      <Typography style={{ userSelect: 'none', cursor: 'pointer' }} onClick={handleClick}>
        {url}
      </Typography>
    </div>
  );
};

export const LeftSideMenu: FunctionComponent = () => {
  const [urlList, setUrlList] = useState<ReactNode[]>(MenuStore.urlList);
  const [hashList, setHashList] = useState<ReactNode[]>(MenuStore.hashList);

  useEffect(() => {
    const dataKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.OPT_GET_LEFT_MENU_DATA, async () => {
      await MenuStore.fetchData();
      setUrlList(MenuStore.urlList.map((v) => <MenuLinkItem key={`item-${v}`} url={v} />));
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
      <Typography align="center" fontSize="1.5em" fontWeight="bold" marginTop={2}>
        urls
      </Typography>
      <div style={{ height: '50%', overflow: 'auto', marginLeft: 10 }}>{urlList}</div>
      <Typography align="center" fontSize="1.5em" fontWeight="bold">
        tags
      </Typography>
      <div style={{ height: '50%', overflow: 'auto', marginLeft: 10 }}>{hashList}</div>
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
