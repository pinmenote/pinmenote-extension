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
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BoardSearchInput } from '../menu/board-search.input';
import Box from '@mui/material/Box';
import { BusMessageType } from '../../../common/model/bus.model';
import { IconButton } from '@mui/material';
import { ObjDto } from '../../../common/model/obj.model';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { PinBoardStore } from '../store/pin-board.store';
import { PinElement } from './pin.element';
import { PinRangeResponse } from '../../../common/model/pin.model';
import Stack from '@mui/material/Stack';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export const PinBoard: FunctionComponent = () => {
  const [pinData, setPinData] = useState<ObjDto<ObjPagePinDto>[]>(PinBoardStore.pins);

  const stackRef = useRef<HTMLDivElement>();

  useEffect(() => {
    // Infinite scroll
    stackRef.current?.addEventListener('scroll', handleScroll);

    const refreshKey = TinyEventDispatcher.addListener<undefined>(BusMessageType.OPT_REFRESH_BOARD, () => {
      setPinData(PinBoardStore.pins.concat());
    });

    const pinSearch = TinyEventDispatcher.addListener<PinRangeResponse>(
      BusMessageType.OPTIONS_PIN_SEARCH,
      (event, key, value) => {
        PinBoardStore.setData(value);
        setPinData(PinBoardStore.pins.concat());
        PinBoardStore.setLoading(false);
      }
    );
    const pinRange = TinyEventDispatcher.addListener<PinRangeResponse>(
      BusMessageType.OPTIONS_PIN_GET_RANGE,
      (event, key, value) => {
        PinBoardStore.setData(value);
        setPinData(PinBoardStore.pins.concat());
        PinBoardStore.setLoading(false);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.OPT_REFRESH_BOARD, refreshKey);
      stackRef.current?.removeEventListener('scroll', handleScroll);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_PIN_SEARCH, pinSearch);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_PIN_GET_RANGE, pinRange);
    };
  });

  const handleScroll = () => {
    fnConsoleLog('handleScroll');
    if (PinBoardStore.isLast) return;
    if (!stackRef.current) return;
    const bottom = stackRef.current.scrollHeight - stackRef.current.clientHeight;
    // This is how offensive programming looks like - escape early instead of wrapping code with conditions
    if (bottom - stackRef.current.scrollTop > 100) return; // too much up
    if (PinBoardStore.isLoading) return; // already loading

    PinBoardStore.setLoading(true);

    // Search for value from last one
    if (PinBoardStore.getSearch()) {
      PinBoardStore.timeout = window.setTimeout(async () => {
        await PinBoardStore.sendSearch();
      }, 1000);
      return;
    }
    window.setTimeout(async () => {
      await PinBoardStore.sendRange();
    }, 250);
  };

  return (
    <div style={{ width: '100%', marginLeft: 20, marginTop: 10 }}>
      <Box style={{ margin: 10, display: 'flex', flexDirection: 'row' }}>
        <BoardSearchInput></BoardSearchInput>
        <IconButton>
          <Typography>aaaa</Typography>
        </IconButton>
      </Box>
      <Stack direction="row" flexWrap="wrap" ref={stackRef} style={{ overflow: 'auto', height: 'calc(100vh - 65px)' }}>
        {pinData.map((pin) => (
          <PinElement pin={pin} key={pin.id} />
        ))}
      </Stack>
    </div>
  );
};
