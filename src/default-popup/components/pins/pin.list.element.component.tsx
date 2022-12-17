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
import { IconButton, Typography } from '@mui/material';
import { PinObject, PinUpdateObject } from '@common/model/pin.model';
import React, { FunctionComponent, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BusMessageType } from '@common/model/bus.model';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { PinPopOver } from './pin.popover.component';
import { PinShareComponent } from './pin-share.component';
import ShareIcon from '@mui/icons-material/Share';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { sendRuntimeMessage } from '@common/message/runtime.message';
import { sendTabMessage } from '@common/message/tab.message';

interface PinListElementProps {
  pin: PinObject;
  visibility: boolean;
}

export const PinListElement: FunctionComponent<PinListElementProps> = ({ pin, visibility }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(pin.visible);
  const handlePinGo = async (data: PinObject): Promise<void> => {
    data.visible = true;
    await sendRuntimeMessage<PinUpdateObject>({
      type: BusMessageType.POPUP_PIN_UPDATE,
      data: {
        pin: data
      }
    });

    await sendRuntimeMessage<PinObject>({ type: BusMessageType.CONTENT_PIN_NAVIGATE, data });
    await sendTabMessage<PinObject>({ type: BusMessageType.CONTENT_PIN_NAVIGATE, data });

    window.close();
  };

  const handlePinVisible = async (data: PinObject): Promise<void> => {
    data.visible = !data.visible;
    await sendRuntimeMessage<PinObject>({ type: BusMessageType.POPUP_PIN_VISIBLE, data });
    setIsVisible(data.visible);
  };

  const handlePinRemove = async (data: PinObject): Promise<void> => {
    await sendRuntimeMessage<PinObject>({ type: BusMessageType.POPUP_PIN_REMOVE, data });
    // Send itself cause command sends message to tab
    TinyEventDispatcher.dispatch(BusMessageType.POPUP_PIN_REMOVE, data);
  };

  const handleShare = async (data: PinObject): Promise<void> => {
    setShareOpen(!isShareOpen);
    setIsPopoverOpen(false);
    if (!data.share && !isShareOpen) {
      await sendRuntimeMessage<PinObject>({ type: BusMessageType.POPUP_PIN_SHARE, data });
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

  const title = pin.value.length > 30 ? `${pin.value.substring(0, 30)}...` : pin.value;

  return (
    <div key={pin.uid} style={{ width: '100%', marginBottom: 15 }}>
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
      <PinPopOver visible={isPopoverOpen} pin={pin}></PinPopOver>
      <PinShareComponent pin={pin} visible={isShareOpen}></PinShareComponent>
    </div>
  );
};
