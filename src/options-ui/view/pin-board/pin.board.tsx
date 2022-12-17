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
import React, { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { BusMessageType } from '@common/model/bus.model';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton } from '@mui/material';
import Input from '@mui/material/Input';
import { PinBoardStore } from '../store/pin-board.store';
import { PinElement } from './pin.element';
import { PinObject } from '@common/model/pin.model';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';

export const PinBoard: FunctionComponent = () => {
  const [pinData, setPinData] = useState<PinObject[]>(PinBoardStore.pins);
  const [searchValue, setSearchValue] = useState<string>(PinBoardStore.getSearch() || '');

  const stackRef = useRef<HTMLDivElement>();

  useEffect(() => {
    // Infinite scroll
    stackRef.current?.addEventListener('scroll', handleScroll);

    const pinRemove = TinyEventDispatcher.addListener<PinObject>(
      BusMessageType.OPTIONS_PIN_REMOVE,
      (event, key, value) => {
        PinBoardStore.removePin(value);
        setPinData(PinBoardStore.pins.concat());
      }
    );

    const pinSearch = TinyEventDispatcher.addListener<PinObject[]>(
      BusMessageType.OPTIONS_PIN_SEARCH,
      (event, key, value) => {
        PinBoardStore.pins.push(...value);
        setSearchValue(PinBoardStore.getSearch() || '');
        setPinData(PinBoardStore.pins.concat());
        PinBoardStore.setLoading(false);
      }
    );
    const pinRange = TinyEventDispatcher.addListener<PinObject[]>(
      BusMessageType.OPTIONS_PIN_GET_RANGE,
      (event, key, value) => {
        PinBoardStore.pins.push(...value);
        setPinData(PinBoardStore.pins.concat());
        PinBoardStore.setLoading(false);
      }
    );
    return () => {
      stackRef.current?.removeEventListener('scroll', handleScroll);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_PIN_REMOVE, pinRemove);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_PIN_SEARCH, pinSearch);
      TinyEventDispatcher.removeListener(BusMessageType.OPTIONS_PIN_GET_RANGE, pinRange);
    };
  });

  const handleScroll = () => {
    if (!stackRef.current) return;
    const bottom = stackRef.current.scrollHeight - stackRef.current.clientHeight;
    // This is how offensive programming looks like - escape early instead of wrapping code with conditions
    if (bottom - stackRef.current.scrollTop > 100) return; // too much up
    if (PinBoardStore.isLoading) return; // already loading

    PinBoardStore.setLoading(true);

    // Search for value from last one
    if (PinBoardStore.getSearch()) {
      PinBoardStore.timeout = window.setTimeout(async () => {
        // Last id found
        PinBoardStore.setFrom(PinBoardStore.pins[PinBoardStore.pins.length - 1].id);
        await PinBoardStore.sendSearch();
      }, 250);
      return;
    }

    // We can proceed
    PinBoardStore.setFrom(PinBoardStore.getFrom() + 10);
    window.setTimeout(async () => {
      await PinBoardStore.sendRange();
    }, 250);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    clearTimeout(PinBoardStore.timeout);
    setSearchValue(e.target.value);
    PinBoardStore.clearSearch();
    setPinData([]);
    if (e.target.value.length <= 2) {
      PinBoardStore.timeout = window.setTimeout(async () => {
        await PinBoardStore.sendRange();
      });
      return;
    } else {
      PinBoardStore.setSearch(e.target.value);
    }
    PinBoardStore.timeout = window.setTimeout(async () => {
      await PinBoardStore.sendSearch();
    }, 1000);
  };

  const handleClearSearch = async () => {
    setSearchValue('');
    PinBoardStore.clearSearch();
    await PinBoardStore.sendRange();
  };

  return (
    <div style={{ width: '100%', marginLeft: 20, marginTop: 10 }}>
      <Box style={{ margin: 10 }}>
        <Input
          startAdornment={<SearchIcon />}
          placeholder="Find note"
          style={{ width: '50%' }}
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          endAdornment={
            PinBoardStore.getSearch() ? (
              <IconButton onClick={handleClearSearch}>
                <ClearIcon />
              </IconButton>
            ) : undefined
          }
        />
      </Box>
      <Stack direction="row" flexWrap="wrap" ref={stackRef} style={{ overflow: 'auto', height: 'calc(100vh - 65px)' }}>
        {pinData.map((pin) => (
          <PinElement pin={pin} key={pin.id} />
        ))}
      </Stack>
    </div>
  );
};
