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
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ActiveTabStore } from '../../store/active-tab.store';
import { BusMessageType } from '@common/model/bus.model';
import { Button } from '@mui/material';
import { LogManager } from '@common/popup/log.manager';
import { PinPopupInitData } from '@common/model/pin.model';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import { sendTabMessage } from '@common/message/tab.message';

export const PinCreateComponent: FunctionComponent = () => {
  const [isAdding, setIsAdding] = useState<boolean>(ActiveTabStore.isAddingNote);

  useEffect(() => {
    const addingKey = TinyEventDispatcher.addListener<PinPopupInitData>(
      BusMessageType.POPUP_INIT,
      (event, key, value) => {
        setIsAdding(value.isAddingNote);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_INIT, addingKey);
    };
  });

  const handleClick = async () => {
    const type = isAdding ? BusMessageType.POPUP_PIN_STOP : BusMessageType.POPUP_PIN_START;
    try {
      await sendTabMessage<undefined>({
        type
      });
    } catch (e) {
      LogManager.log(JSON.stringify(e));
    }
    window.close();
  };

  return (
    <div style={{ display: 'flex' }}>
      <Button sx={{ width: '100%' }} variant="outlined" onClick={handleClick}>
        {isAdding ? 'Cancel' : 'Create New Pin'}
      </Button>
    </div>
  );
};
