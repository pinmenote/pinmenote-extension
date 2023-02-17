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
import React, { FunctionComponent, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ObjDto } from '../../../common/model/obj.model';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinExpandComponent } from './pin.expand.component';
import { PinRemoveCommand } from '../../../common/command/pin/pin-remove.command';
import { PinShareComponent } from './pin-share.component';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import RemoveMarkdown from 'remove-markdown';
import ShareIcon from '@mui/icons-material/Share';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface PinListElementProps {
  pin: ObjDto<ObjPagePinDto>;
  visibility: boolean;
}

export const PinListElement: FunctionComponent<PinListElementProps> = ({ pin, visibility }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(pin.local?.visible);
  const handlePinGo = async (data: ObjDto<ObjPagePinDto>): Promise<void> => {
    data.local.visible = true;
    await new PinUpdateCommand(data).execute();
    await BrowserStorageWrapper.set(ObjectStoreKeys.PIN_NAVIGATE, data);

    await BrowserApi.sendTabMessage<void>({ type: BusMessageType.CONTENT_PIN_NAVIGATE });

    window.close();
  };

  const handlePinVisible = async (data: ObjDto<ObjPagePinDto>): Promise<void> => {
    data.local.visible = !data.local.visible;
    await new PinUpdateCommand(data).execute();
    setIsVisible(data.local.visible);
  };

  const handlePinRemove = async (data: ObjDto<ObjPagePinDto>): Promise<void> => {
    await new PinRemoveCommand(data).execute();
    await BrowserApi.sendTabMessage<number>({ type: BusMessageType.CONTENT_PIN_REMOVE, data: data.id });
    TinyEventDispatcher.dispatch(BusMessageType.POP_PIN_REMOVE, data);
  };

  const handleShare = async (data: ObjDto<ObjPagePinDto>): Promise<void> => {
    setShareOpen(!isShareOpen);
    setIsPopoverOpen(false);
    if (!data.share && !isShareOpen) {
      await BrowserApi.sendRuntimeMessage<ObjDto<ObjPagePinDto>>({ type: BusMessageType.POPUP_PIN_SHARE, data });
    }
  };

  const handlePopover = (): void => {
    setIsPopoverOpen(!isPopoverOpen);
    setShareOpen(false);
  };

  const expandIcon = isPopoverOpen ? (
    <ExpandMoreIcon sx={{ fontSize: '12px' }} />
  ) : (
    <NavigateNextIcon sx={{ fontSize: '12px' }} />
  );

  const visibleIcon = visibility ? (
    <IconButton size="small" onClick={() => handlePinVisible(pin)}>
      {isVisible ? <VisibilityIcon sx={{ fontSize: '12px' }} /> : <VisibilityOffIcon sx={{ fontSize: '12px' }} />}
    </IconButton>
  ) : (
    ''
  );
  const value = RemoveMarkdown(pin.data.value);
  const title = value.length > 30 ? `${value.substring(0, 30)}...` : value;

  return (
    <div key={pin.id} style={{ width: '100%', marginBottom: 15 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
          <IconButton title="Go to pin" size="small" onClick={() => handleShare(pin)}>
            <ShareIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          {visibleIcon}
          <IconButton title="Go to pin" size="small" onClick={() => handlePinGo(pin)}>
            <ArrowForwardIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <IconButton title="Remove pin" size="small" onClick={() => handlePinRemove(pin)}>
            <CloseIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        </div>
      </div>
      <PinExpandComponent visible={isPopoverOpen} pin={pin}></PinExpandComponent>
      <PinShareComponent pin={pin} visible={isShareOpen}></PinShareComponent>
    </div>
  );
};
