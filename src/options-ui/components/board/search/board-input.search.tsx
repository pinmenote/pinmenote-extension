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
import { BoardStore } from '../../../store/board.store';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { StyledInputBlack } from '../../../../common/components/react/styled.input';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

interface BoardInputSearchParams {
  searchCallback: (value: string) => void;
}

export const BoardInputSearch: FunctionComponent<BoardInputSearchParams> = ({ searchCallback }) => {
  const [searchValue, setSearchValue] = useState<string>(BoardStore.getSearch() || '');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(BoardStore.timeout);
    setSearchValue(e.target.value);
    searchCallback(e.target.value);
  };

  const handleClearSearch = () => {
    fnConsoleLog('handleClearSearch');
    setSearchValue('');
    searchCallback('');
  };
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <StyledInputBlack
        startAdornment={<SearchIcon style={{ marginRight: 10 }} />}
        placeholder="Search"
        style={{ width: '100%' }}
        type="text"
        value={searchValue}
        onChange={handleSearchChange}
        endAdornment={
          searchValue ? (
            <ClearIcon style={{ userSelect: 'none', cursor: 'pointer' }} onClick={handleClearSearch} />
          ) : undefined
        }
      />
    </div>
  );
};
