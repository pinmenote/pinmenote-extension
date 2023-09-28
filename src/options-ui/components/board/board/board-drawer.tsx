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
import React, { FunctionComponent, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Drawer } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { BrowserStorage } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../../common/model/bus.model';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { DrawerTag } from './drawer-tag';
import { BoardStore } from '../../../store/board.store';

interface Props {
  showDrawer: boolean;
}

const fetchTags = async (): Promise<string[]> => {
  const tags = await BrowserStorage.get<string[] | undefined>(ObjectStoreKeys.TAG_WORD);
  return tags || [];
};

export const BoardDrawer: FunctionComponent<Props> = (props) => {
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  useEffect(() => {
    const dispatcher = TinyDispatcher.getInstance();
    const tagRefreshKey = dispatcher.addListener(BusMessageType.POP_REFRESH_TAGS, async () => {
      const t = await fetchTags();
      setTags(t);
    });
    setTimeout(async () => {
      const t = await fetchTags();
      setTags(t);
    });
    return () => {
      dispatcher.removeListener(BusMessageType.POP_REFRESH_TAGS, tagRefreshKey);
    };
  }, [tags]);

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
    objs.push(<DrawerTag key={`t-${tag}`} value={tag} selectionChange={handleTagSelect} />);
  }

  return (
    <Drawer open={props.showDrawer} anchor="left" variant="persistent">
      <Toolbar />
      <Box sx={{ overflow: 'auto', width: 200, maxWidth: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" fontWeight="bold" style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
            Tags
          </Typography>
        </div>
        <div>{objs}</div>
      </Box>
    </Drawer>
  );
};
