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
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Drawer, Input } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { BusMessageType } from '../../../../common/model/bus.model';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { DrawerTag } from './drawer-tag';
import { BoardStore } from '../../../store/board.store';
import { BoardItemMediator } from '../board-item.mediator';
import ClearIcon from '@mui/icons-material/Clear';

interface Props {
  showDrawer: boolean;
}

export const BoardDrawer: FunctionComponent<Props> = (props) => {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  useEffect(() => {
    const dispatcher = TinyDispatcher.getInstance();
    const tagRefreshKey = dispatcher.addListener(BusMessageType.POP_REFRESH_TAGS, async () => {
      const t = await BoardItemMediator.fetchTags();
      setAllTags(t.concat());
      setSearchValue('');
      setTags(t);
    });
    setTimeout(async () => {
      const t = await BoardItemMediator.fetchTags();
      setAllTags(t.concat());
      setTags(t);
    });
    return () => {
      dispatcher.removeListener(BusMessageType.POP_REFRESH_TAGS, tagRefreshKey);
    };
  }, []);

  const handleTagSelect = async (value: string) => {
    const index = selectedTags.indexOf(value);
    if (index > -1) {
      selectedTags.splice(index, 1);
    } else {
      selectedTags.push(value);
    }
    if (selectedTags.length === 0) {
      await BoardStore.clearTags();
    } else {
      await BoardStore.setTags(selectedTags);
    }
    setSelectedTags(selectedTags);
  };

  const objs: React.ReactNode[] = [];
  for (const tag of tags) {
    if (selectedTags.indexOf(tag) > -1) continue;
    objs.push(<DrawerTag key={`t-${tag}`} value={tag} selected={false} selectionChange={handleTagSelect} />);
  }

  const selectedObjs: React.ReactNode[] = [];
  for (const tag of selectedTags) {
    selectedObjs.push(<DrawerTag key={`ts-${tag}`} value={tag} selected={true} selectionChange={handleTagSelect} />);
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    handleFilterTags(e.target.value);
  };

  const handleFilterTags = (value: string) => {
    const foundTags = allTags.concat().filter((t) => t.indexOf(value) > -1);
    setSearchValue(value);
    setTags(foundTags);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setTags(allTags.concat());
  };

  return (
    <Drawer open={props.showDrawer} anchor="left" variant="persistent">
      <Toolbar />
      <Box sx={{ overflow: 'auto', width: 200, maxWidth: 200 }}>
        <div style={{ position: 'absolute', width: '100%', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Typography variant="h6" fontWeight="bold" style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
              Tags
            </Typography>
          </div>
          <Input
            placeholder="Filter"
            value={searchValue}
            onInput={handleSearch}
            sx={{ marginLeft: 1 }}
            endAdornment={
              searchValue ? (
                <ClearIcon style={{ userSelect: 'none', cursor: 'pointer' }} onClick={handleClearSearch} />
              ) : undefined
            }
          />
        </div>
        <div style={{ marginTop: 70 }}>{selectedObjs}</div>
        <div style={{ marginBottom: 10 }}>{objs}</div>
      </Box>
    </Drawer>
  );
};
