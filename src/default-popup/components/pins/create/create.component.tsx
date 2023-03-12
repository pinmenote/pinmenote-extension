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
import AddIcon from '@mui/icons-material/Add';
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { CreateListComponent } from './create.list.component';
import IconButton from '@mui/material/IconButton';
import { LogManager } from '../../../../common/popup/log.manager';
import { ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { PopupActiveTabStore } from '../../../store/popup-active-tab.store';
import { PopupPinStartRequest } from '../../../../common/model/obj-request.model';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';

export const CreateComponent: FunctionComponent = () => {
  const [isAdding, setIsAdding] = useState<boolean>(PopupActiveTabStore.isAddingNote);
  const [isListVisible, setIsListVisible] = useState<boolean>(false);

  useEffect(() => {
    const urlKey = TinyEventDispatcher.addListener(BusMessageType.POP_UPDATE_URL, () => {
      setIsAdding(PopupActiveTabStore.isAddingNote);
    });
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POP_UPDATE_URL, urlKey);
    };
  });

  const handleNewPin = async () => {
    try {
      if (!PopupActiveTabStore.url) return;
      await BrowserApi.sendTabMessage<PopupPinStartRequest>({
        type: BusMessageType.POPUP_PIN_START,
        data: {
          url: PopupActiveTabStore.url,
          type: ObjTypeDto.PageElementPin
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

  const pinBtn = isAdding ? (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handlePinStop}>
      Cancel
    </Button>
  ) : (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handleNewPin}>
      <AddIcon /> New Pin
    </Button>
  );

  const handleAddElementClick = () => {
    setIsListVisible(!isListVisible);
  };

  return (
    <div style={{ display: 'flex' }}>
      {pinBtn}
      <IconButton title="Add Element" onClick={handleAddElementClick}>
        <AddIcon />
      </IconButton>
      <div
        style={{
          display: isListVisible ? 'inline-block' : 'none',
          position: 'absolute',
          top: 110,
          right: 10,
          backgroundColor: '#ffffff',
          border: '1px solid #eeeeee',
          zIndex: 1000
        }}
      >
        <CreateListComponent closeListCallback={() => setIsListVisible(false)} />
      </div>
    </div>
  );
};
