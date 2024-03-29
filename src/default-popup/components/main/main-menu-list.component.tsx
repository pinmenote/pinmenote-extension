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
import { PopupPageCustomizeRequest, PopupPinStartRequest } from '../../../common/model/obj-request.model';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FunctionsIcon from '@mui/icons-material/Functions';
import HtmlIcon from '@mui/icons-material/Html';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { LogManager } from '../../../common/popup/log.manager';
import { MainViewEnum } from '../component-model';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { ObjTypeDto } from '../../../common/model/obj/obj.dto';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import PushPinIcon from '@mui/icons-material/PushPin';
import { SaveElementIcon } from '../../../common/components/react/save-element.icon';
import WebOutlined from '@mui/icons-material/WebOutlined';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';

const zeroPad = {
  margin: 0,
  padding: 0
};

interface Props {
  closeListCallback: (viewType: MainViewEnum) => void;
}

export const MainMenuListComponent: FunctionComponent<Props> = (props) => {
  const [isPdf, setIsPdf] = useState<boolean>(false);
  useEffect(() => {
    TinyDispatcher.getInstance().addListener<boolean>(
      BusMessageType.POPUP_IS_PDF,
      (event, key, value) => {
        setIsPdf(value);
      },
      true
    );
    // We open it in current tab so not necessary but maybe add tabId for consistence
    BrowserApi.sendTabMessage({ type: BusMessageType.POPUP_IS_PDF }).catch(() => {
      /* IGNORE */
    });
  }, []);
  const handleSavePageClick = () => {
    props.closeListCallback(MainViewEnum.SAVE_PROGRESS);
  };

  const handleSavePdfClick = async () => {
    await BrowserApi.sendTabMessage({ type: BusMessageType.POPUP_SAVE_PDF, data: PopupActiveTabStore.url });
    props.closeListCallback(MainViewEnum.SAVE_PROGRESS);
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
    } finally {
      window.close();
    }
  };

  const handleAlterPageClick = async (): Promise<void> => {
    if (!PopupActiveTabStore.url) return;
    await BrowserApi.sendTabMessage<PopupPageCustomizeRequest>({
      type: BusMessageType.POPUP_PAGE_ALTER_START,
      data: {
        url: PopupActiveTabStore.url,
        type: ObjTypeDto.PageAlter
      }
    });
    props.closeListCallback(MainViewEnum.PAGE_OBJECTS);
    window.close();
  };

  return (
    <div style={{ marginTop: 10 }}>
      <List sx={zeroPad}>
        <ListItem sx={zeroPad} style={{ display: isPdf ? 'none' : 'inline-block' }}>
          <ListItemButton onClick={handleSavePageClick}>
            <ListItemIcon>
              <WebOutlined />
            </ListItemIcon>
            <ListItemText primary="Save Page" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad} style={{ display: isPdf ? 'none' : 'inline-block' }}>
          <ListItemButton onClick={handleSaveElementClick}>
            <ListItemIcon>
              <SaveElementIcon />
            </ListItemIcon>
            <ListItemText primary="Save Fragment" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad} style={{ display: isPdf ? 'inline-block' : 'none' }}>
          <ListItemButton onClick={handleSavePdfClick}>
            <ListItemIcon>
              <PictureAsPdfIcon />
            </ListItemIcon>
            <ListItemText primary="Save PDF" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad} style={{ display: 'none' }}>
          <ListItemButton onClick={handleAlterPageClick}>
            <ListItemIcon>
              <HtmlIcon />
            </ListItemIcon>
            <ListItemText primary="Alter Page" />
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
        <ListItem sx={zeroPad} style={{ display: 'none' }}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.CALENDAR)}>
            <ListItemIcon>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => handleNewPin()}>
            <ListItemIcon>
              <PushPinIcon />
            </ListItemIcon>
            <ListItemText primary="Add pin" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={zeroPad}>
          <ListItemButton onClick={() => props.closeListCallback(MainViewEnum.NOTE)}>
            <ListItemIcon>
              <NoteOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="New Note" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};
