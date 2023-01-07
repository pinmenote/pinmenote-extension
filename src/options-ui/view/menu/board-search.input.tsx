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
import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton } from '@mui/material';
import Input from '@mui/material/Input';
import { PinBoardStore } from '../store/pin-board.store';
import SearchIcon from '@mui/icons-material/Search';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export const BoardSearchInput: FunctionComponent = () => {
  const [searchValue, setSearchValue] = useState<string>(PinBoardStore.getSearch() || '');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    fnConsoleLog('handleSearchChange');
    clearTimeout(PinBoardStore.timeout);
    setSearchValue(e.target.value);
    PinBoardStore.clearSearch();
    // setPinData([]);
    if (e.target.value.length <= 2) {
      PinBoardStore.timeout = window.setTimeout(async () => {
        await PinBoardStore.sendRange();
      }, 1000);
      return;
    } else {
      PinBoardStore.setSearch(e.target.value);
    }
    PinBoardStore.timeout = window.setTimeout(async () => {
      await PinBoardStore.sendSearch();
    }, 1000);
  };

  const handleClearSearch = async () => {
    fnConsoleLog('handleClearSearch');
    setSearchValue('');
    PinBoardStore.clearSearch();
    await PinBoardStore.sendRange();
  };
  return (
    <div style={{ width: '50%' }}>
      <Input
        startAdornment={<SearchIcon />}
        placeholder="Find object"
        style={{ width: '100%' }}
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
    </div>
  );
};
