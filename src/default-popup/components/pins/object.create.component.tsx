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
import { ActiveTabStore } from '../../store/active-tab.store';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { BookmarkRemoveCommand } from '../../../common/command/bookmark/bookmark-remove.command';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { LogManager } from '../../../common/popup/log.manager';
import { ObjBookmarkDto } from '../../../common/model/obj-bookmark.model';
import { ObjDto } from '../../../common/model/obj.model';
import { PopupPinStartRequest } from '../../../common/model/obj-request.model';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';

export const ObjectCreateComponent: FunctionComponent = () => {
  const [isAdding, setIsAdding] = useState<boolean>(ActiveTabStore.isAddingNote);
  const [bookmarkData, setBookmarkData] = useState<ObjDto<ObjBookmarkDto> | undefined>(ActiveTabStore.bookmark);

  useEffect(() => {
    const urlKey = TinyEventDispatcher.addListener(BusMessageType.POP_UPDATE_URL, () => {
      setIsAdding(ActiveTabStore.isAddingNote);
      setBookmarkData(ActiveTabStore.bookmark);
    });
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POP_UPDATE_URL, urlKey);
    };
  });

  const handleNewPin = async () => {
    try {
      if (!ActiveTabStore.url) return;
      await BrowserApi.sendTabMessage<PopupPinStartRequest>({
        type: BusMessageType.POPUP_PIN_START,
        data: {
          url: ActiveTabStore.url
        }
      });
    } catch (e) {
      LogManager.log(JSON.stringify(e));
    }
    window.close();
  };

  const handlePinStop = async () => {
    try {
      await BrowserApi.sendTabMessage<undefined>({
        type: BusMessageType.POPUP_PIN_STOP
      });
    } catch (e) {
      LogManager.log(JSON.stringify(e));
    }
    window.close();
  };

  const handleBookmarkAdd = async () => {
    TinyEventDispatcher.addListener<string>(BusMessageType.POPUP_BOOKMARK_ADD, async (event, key) => {
      TinyEventDispatcher.removeListener(event, key);
      await ActiveTabStore.refreshBookmark();
      setBookmarkData(ActiveTabStore.bookmark);
    });
    await BrowserApi.sendTabMessage({ type: BusMessageType.POPUP_BOOKMARK_ADD, data: ActiveTabStore.url });
  };

  const handleBookmarkRemove = async () => {
    if (!bookmarkData) return;
    await new BookmarkRemoveCommand(bookmarkData).execute();
    setBookmarkData(undefined);
  };

  const pinBtn = isAdding ? (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handlePinStop}>
      Cancel
    </Button>
  ) : (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handleNewPin}>
      <AddIcon /> New Pin
    </Button>
  );

  const bookmarkBtn =
    bookmarkData !== undefined ? (
      <IconButton title="Remove bookmark" onClick={handleBookmarkRemove}>
        <BookmarkIcon />
      </IconButton>
    ) : (
      <IconButton title="Add bookmark" onClick={handleBookmarkAdd}>
        <BookmarkBorderIcon />
      </IconButton>
    );

  return (
    <div style={{ display: 'flex' }}>
      {pinBtn}
      {bookmarkBtn}
    </div>
  );
};
