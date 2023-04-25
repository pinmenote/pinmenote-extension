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
import React, { FunctionComponent, useState } from 'react';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CircularProgress from '@mui/material/CircularProgress';
import FunctionsIcon from '@mui/icons-material/Functions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { MainViewEnum } from '../component-model';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import { PopupPinStartRequest } from '../../../common/model/obj-request.model';
import PushPinIcon from '@mui/icons-material/PushPin';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import WebOutlined from '@mui/icons-material/WebOutlined';

const zeroPad = {
  margin: 0,
  padding: 0
};

interface CreateListProps {
  closeListCallback: (viewType: MainViewEnum) => void;
}

enum IsLoadingType {
  None,
  PageSave
}

export const MainMenuListComponent: FunctionComponent<CreateListProps> = (props) => {
  const [isLoading, setIsLoading] = useState<IsLoadingType>(IsLoadingType.None);

  const handleSavePageClick = async () => {
    TinyEventDispatcher.addListener<string>(BusMessageType.POPUP_PAGE_SNAPSHOT_ADD, (event, key) => {
      TinyEventDispatcher.removeListener(event, key);
      setIsLoading(IsLoadingType.None);
      setTimeout(() => props.closeListCallback(MainViewEnum.PAGE_OBJECTS), 100);
    });
    await BrowserApi.sendTabMessage({ type: BusMessageType.POPUP_PAGE_SNAPSHOT_ADD, data: PopupActiveTabStore.url });
    setIsLoading(IsLoadingType.PageSave);
  };

  const handleSaveElementClick = async (): Promise<void> => {
    if (!PopupActiveTabStore.url) return;
    await BrowserApi.sendTabMessage<PopupPinStartRequest>({
      type: BusMessageType.POPUP_CAPTURE_ELEMENT_START,
      data: {
        url: PopupActiveTabStore.url,
        type: ObjTypeDto.PageElementSnapshot
      }
    });
    props.closeListCallback(MainViewEnum.PAGE_OBJECTS);
    window.close();
  };

  return (
    <div style={{ marginTop: 10 }}>
      <List sx={zeroPad}>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={handleSaveElementClick}>
            <ListItemIcon>
              <SaveElementIcon />
            </ListItemIcon>
            <ListItemText primary="Save Page Fragment" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={handleSavePageClick}>
            <ListItemIcon>{isLoading === IsLoadingType.PageSave ? <CircularProgress /> : <WebOutlined />}</ListItemIcon>
            <ListItemText primary="Save Page" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.PAGE_OBJECTS)}>
            <ListItemIcon>
              <PushPinIcon />
            </ListItemIcon>
            <ListItemText primary="Show Page Objects" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad} style={{ display: 'none' }}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.FUNCTION)}>
            <ListItemIcon>
              <FunctionsIcon />
            </ListItemIcon>
            <ListItemText primary="Use Function" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.CALENDAR)}>
            <ListItemIcon>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.TASK)}>
            <ListItemIcon>
              <AddTaskIcon />
            </ListItemIcon>
            <ListItemText primary="Task" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.NOTE)}>
            <ListItemIcon>
              <NoteOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Note" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.ENCRYPT)}>
            <ListItemIcon>
              <LockIcon />
            </ListItemIcon>
            <ListItemText primary="Encrypt" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.DECRYPT)}>
            <ListItemIcon>
              <LockOpenIcon />
            </ListItemIcon>
            <ListItemText primary="Decrypt" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};

const SaveElementIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="#777777" height="24" viewBox="0 0 24 24" width="24">
      <g>
        <path
          d="M20,4H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z
                  M20,18l-3.5,0V9H20V18z"
        />
      </g>
    </svg>
  );
};
