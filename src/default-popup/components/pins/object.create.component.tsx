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
import { Button, IconButton } from '@mui/material';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ActiveTabStore } from '../../store/active-tab.store';
import AddIcon from '@mui/icons-material/Add';
import { BookmarkAddCommand } from '../../../common/command/bookmark/bookmark-add.command';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { LogManager } from '../../../common/popup/log.manager';
import { PinPopupInitData } from '../../../common/model/pin.model';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import BookmarkDto = Pinmenote.Bookmark.BookmarkDto;

export const ObjectCreateComponent: FunctionComponent = () => {
  const [isAdding, setIsAdding] = useState<boolean>(ActiveTabStore.isAddingNote);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(ActiveTabStore.isBookmarked);

  useEffect(() => {
    const addingKey = TinyEventDispatcher.addListener<PinPopupInitData>(
      BusMessageType.POPUP_INIT,
      (event, key, value) => {
        setIsAdding(value.isAddingNote);
        setIsBookmarked(value.isBookmarked);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_INIT, addingKey);
    };
  });

  const handlePinStart = async () => {
    try {
      await BrowserApi.sendTabMessage<undefined>({
        type: BusMessageType.POPUP_PIN_START
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
    if (!ActiveTabStore.url) return;
    await new BookmarkAddCommand(ActiveTabStore.pageTitle, ActiveTabStore.url).execute();
    window.close();
  };

  const handleBookmarkRemove = async () => {
    try {
      await BrowserApi.sendRuntimeMessage<BookmarkDto>({
        type: BusMessageType.POPUP_BOOKMARK_REMOVE,
        data: {
          value: ActiveTabStore.pageTitle,
          isDirectory: false,
          url: ActiveTabStore.url
        }
      });
    } catch (e) {
      LogManager.log(JSON.stringify(e));
    }
    window.close();
  };

  const pinBtn = isAdding ? (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handlePinStop}>
      Cancel
    </Button>
  ) : (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handlePinStart}>
      <AddIcon /> New Pin
    </Button>
  );

  const bookmarkBtn = isBookmarked ? (
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
