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
import { BrowserApi } from '@pinmenote/browser-api';
import { PageNoteDraftRemoveCommand } from '../../../common/command/page-note/draft/page-note-draft-remove.command';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { LogManager } from '../../../common/popup/log.manager';
import { MainViewEnum } from '../component-model';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';

interface Props {
  currentView: MainViewEnum;
  previousView: MainViewEnum;
  changeMainTabCallback: (viewType: MainViewEnum) => void;
}

export const MainHeaderComponent: FunctionComponent<Props> = (props) => {
  const [isAdding, setIsAdding] = useState<boolean>(PopupActiveTabStore.isAdding);

  useEffect(() => {
    const addKey = TinyDispatcher.getInstance().addListener<boolean>(
      BusMessageType.POP_IS_ADDING,
      (event, key, value) => {
        PopupActiveTabStore.isAdding = value;
        setIsAdding(value);
      }
    );
    return () => {
      TinyDispatcher.getInstance().removeListener(BusMessageType.POP_IS_ADDING, addKey);
    };
  }, []);

  const handleCancel = async () => {
    if (isAdding) {
      try {
        await BrowserApi.sendRuntimeMessage({
          type: BusMessageType.CONTENT_STOP_LISTENERS
        });
      } catch (e) {
        LogManager.log(JSON.stringify(e));
      }
      await new PageNoteDraftRemoveCommand().execute();
      setIsAdding(false);
    }
    props.changeMainTabCallback(MainViewEnum.PAGE_OBJECTS);
  };

  const handleAddElementClick = () => {
    LogManager.log(`handleAddElementClick ${props.currentView}`);
    if (props.currentView === MainViewEnum.CREATE_LIST) {
      props.changeMainTabCallback(props.previousView);
      setIsAdding(false);
    } else {
      props.changeMainTabCallback(MainViewEnum.CREATE_LIST);
      setIsAdding(true);
    }
  };

  const pinBtn = isAdding ? (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handleCancel}>
      Cancel
    </Button>
  ) : (
    <Button sx={{ width: '100%' }} variant="outlined" onClick={handleAddElementClick}>
      <AddIcon />
      NEW
    </Button>
  );

  return <div style={{ display: 'flex' }}>{pinBtn}</div>;
};
