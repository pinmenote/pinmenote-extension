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
import { ActiveTabStore } from '../../../store/active-tab.store';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { BookmarkRemoveCommand } from '../../../../common/command/bookmark/bookmark-remove.command';
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../../common/model/bus.model';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ObjBookmarkDto } from '../../../../common/model/obj/obj-bookmark.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import WebOutlined from '@mui/icons-material/WebOutlined';

const zeroPad = {
  margin: 0,
  padding: 0
};

export const CreateListComponent: FunctionComponent = () => {
  const [bookmarkData, setBookmarkData] = useState<ObjDto<ObjBookmarkDto> | undefined>(ActiveTabStore.bookmark);

  useEffect(() => {
    setBookmarkData(ActiveTabStore.bookmark);
  });

  const handleBookmarkClick = async () => {
    if (bookmarkData) {
      await new BookmarkRemoveCommand(bookmarkData).execute();
      setBookmarkData(undefined);
    } else {
      TinyEventDispatcher.addListener<string>(BusMessageType.POPUP_BOOKMARK_ADD, async (event, key) => {
        TinyEventDispatcher.removeListener(event, key);
        await ActiveTabStore.refreshBookmark();
        setBookmarkData(ActiveTabStore.bookmark);
      });
      await BrowserApi.sendTabMessage({ type: BusMessageType.POPUP_BOOKMARK_ADD, data: ActiveTabStore.url });
    }
  };

  const bookmarkIcon = bookmarkData !== undefined ? <BookmarkIcon /> : <BookmarkBorderIcon />;
  const bookmarkText = bookmarkData !== undefined ? 'Remove Bookmark' : 'Add Bookmark';

  return (
    <div>
      <List sx={zeroPad}>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={handleBookmarkClick}>
            <ListItemIcon>{bookmarkIcon}</ListItemIcon>
            <ListItemText primary={bookmarkText} />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={handleBookmarkClick}>
            <ListItemIcon>
              <WebOutlined />
            </ListItemIcon>
            <ListItemText primary="Save Page" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={handleBookmarkClick}>
            <ListItemIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="#777777" height="24" viewBox="0 0 24 24" width="24">
                <g>
                  <path
                    d="M20,4H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z
                  M20,18l-3.5,0V9H20V18z"
                  />
                </g>
              </svg>
            </ListItemIcon>
            <ListItemText primary="Save Element" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};
