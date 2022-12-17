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
import { BusMessageType } from '@common/model/bus.model';
import { PinBoardStore } from '../store/pin-board.store';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { fnGetKey } from '@common/kv.utils';
import { sendRuntimeMessage } from '@common/message/runtime.message';

class MenuStore {
  static readonly ALL_URLS = '<all_urls>';
  private static sent = false;

  static urlList: string[] = [];
  static hashList: string[] = [];

  static initialize(): void {
    if (this.sent) return;
    this.getHashList()
      .then(() => {
        /* ignore */
      })
      .catch(() => {
        /* ignore */
      });
    this.getOriginUrls()
      .then(() => {
        /* ignore */
      })
      .catch(() => {
        /* ignore */
      });
    this.sent = true;
  }

  private static async getHashList(): Promise<void> {
    await sendRuntimeMessage<undefined>({ type: BusMessageType.OPTIONS_PIN_GET_HASH_LIST });
  }

  private static async getOriginUrls(): Promise<void> {
    await sendRuntimeMessage<undefined>({ type: BusMessageType.OPTIONS_GET_ORIGIN_URLS });
  }
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
    const urlsKey = TinyEventDispatcher.addListener<string[]>(
      BusMessageType.OPTIONS_GET_ORIGIN_URLS,
      (event, key, value) => {
        MenuStore.urlList = value.sort();
        value.unshift(MenuStore.ALL_URLS);
        setUrlList(value.map((v) => <MenuLinkItem key={`item-${v}`} url={v} />));
      }
    );
    const hashKey = TinyEventDispatcher.addListener<string[]>(
      BusMessageType.OPTIONS_PIN_GET_HASH_LIST,
      (event, key, value) => {
        MenuStore.hashList = value.sort();
        setHashList(value.map((h) => <Typography key={`hash-${h}`}>{h}</Typography>));
      }
    );
    MenuStore.initialize();
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_PIN_GET_HASH_LIST, hashKey);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_GET_ORIGIN_URLS, urlsKey);
    };
  });

  const handleSettingsClick = () => {
    window.location.hash = 'settings';
  };

  return (
    <div style={{ minWidth: 250, maxWidth: 250, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column' }}>
        <div style={{ display: 'flex', marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={fnGetKey(chrome.runtime.getManifest().icons, '32')}
            width="32"
            height="32"
            style={{ marginRight: 10 }}
          />
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
