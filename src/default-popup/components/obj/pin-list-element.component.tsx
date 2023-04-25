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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinListExpandComponent } from './pin-list-expand.component';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import PushPinIcon from '@mui/icons-material/PushPin';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface PinListElementProps {
  obj: ObjDto<ObjPagePinDto>;
  visibility: boolean;
  removeCallback: (pin: ObjDto<ObjPagePinDto>) => void;
}

export const PinListElement: FunctionComponent<PinListElementProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(props.obj.local?.visible);
  const handlePinGo = async (data: ObjDto<ObjPagePinDto>): Promise<void> => {
    data.local.visible = true;
    await new PinUpdateCommand(data).execute();

    if (PopupActiveTabStore.url?.href !== data.data.snapshot.url.href) {
      await BrowserApi.setActiveTabUrl(data.data.snapshot.url.href);
    } else {
      await BrowserApi.sendTabMessage<ObjDto<ObjPagePinDto>>({ type: BusMessageType.CONTENT_PIN_NAVIGATE, data });
    }
    window.close();
  };

  const handlePinVisible = async (data: ObjDto<ObjPagePinDto>): Promise<void> => {
    data.local.visible = !data.local.visible;
    await new PinUpdateCommand(data).execute();
    setIsVisible(data.local.visible);
  };

  const handlePinRemove = (data: ObjDto<ObjPagePinDto>): void => {
    props.removeCallback(data);
  };

  const handlePopover = (): void => {
    setIsExpanded(!isExpanded);
  };

  const expandIcon = isExpanded ? (
    <ExpandMoreIcon sx={{ fontSize: '12px' }} />
  ) : (
    <NavigateNextIcon sx={{ fontSize: '12px' }} />
  );

  const visibleIcon = props.visibility ? (
    <IconButton size="small" onClick={() => handlePinVisible(props.obj)}>
      {isVisible ? <VisibilityIcon sx={{ fontSize: '12px' }} /> : <VisibilityOffIcon sx={{ fontSize: '12px' }} />}
    </IconButton>
  ) : (
    ''
  );
  const value = props.obj.data.snapshot.title;
  const title = value.length > 30 ? `${value.substring(0, 30)}...` : value;

  return (
    <div key={props.obj.id} style={{ width: '100%', marginBottom: 15 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ color: '#777777' }}>
            <PushPinIcon />
          </div>
          <IconButton size="small" onClick={handlePopover}>
            {expandIcon}
          </IconButton>
          <Typography style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px' }} onClick={handlePopover}>
            {title}
          </Typography>
        </div>
        <div
          style={{
            textAlign: 'right',
            marginRight: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          {visibleIcon}
          <IconButton title="Go to pin" size="small" onClick={() => handlePinGo(props.obj)}>
            <ArrowForwardIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <IconButton title="Remove pin" size="small" onClick={() => handlePinRemove(props.obj)}>
            <CloseIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        </div>
      </div>
      <PinListExpandComponent visible={isExpanded} pin={props.obj}></PinListExpandComponent>
    </div>
  );
};
