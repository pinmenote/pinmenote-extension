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
import React, { FunctionComponent } from 'react';
import AppBar from '@mui/material/AppBar';
import { BoardAddElementSearch } from '../board/search/board-add-element.search';
import { BoardInputSearch } from '../board/search/board-input.search';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { appLight32Icon } from '../../../common/components/app-icons';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export const BoardMenu: FunctionComponent = () => {
  const handleSettingsClick = () => {
    window.location.hash = 'settings';
  };

  const handleSearch = (value: string) => {
    fnConsoleLog('BoardMenu->handleSearch', value);
  };
  return (
    <AppBar position="static">
      <Toolbar variant="dense" sx={{ flexGrow: 1 }}>
        <IconButton size="small" edge="start" color="inherit" aria-label="open drawer">
          <MenuIcon />
        </IconButton>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '10px' }}>
          <img src={appLight32Icon()} width="24" height="24" style={{ marginRight: 10 }} />
          <Typography variant="h6" style={{ userSelect: 'none' }}>
            pinmenote
          </Typography>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 10, flexGrow: 1 }}>
          <BoardInputSearch searchCallback={handleSearch}></BoardInputSearch>
          <BoardAddElementSearch></BoardAddElementSearch>
        </div>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <IconButton size="small" aria-label="show 4 new mails" color="inherit" onClick={handleSettingsClick}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
