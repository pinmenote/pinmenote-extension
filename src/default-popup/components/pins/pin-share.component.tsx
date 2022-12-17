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
import { BusMessageType } from '@common/model/bus.model';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';
import { PinObject } from '@common/model/pin.model';
import { StyledInput } from '@common/components/react/styled.input';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import ShareUrlDto = Pinmenote.Share.ShareUrlDto;

export interface PinShareProps {
  pin: PinObject;
  visible: boolean;
}

export const PinShareComponent: FunctionComponent<PinShareProps> = ({ pin, visible }) => {
  const [share, setShare] = useState<ShareUrlDto | undefined>();

  useEffect(() => {
    const shareKey = TinyEventDispatcher.addListener<ShareUrlDto>(
      BusMessageType.POPUP_PIN_SHARE,
      (event, key, value) => {
        setShare(value);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_PIN_SHARE, shareKey);
    };
  });

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(share?.url || '');
  };

  return (
    <div style={{ display: visible ? 'inline-block' : 'none', margin: 10 }}>
      <div style={{ fontSize: '1.5em' }}>Share: {pin.value}</div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <StyledInput style={{ width: 250 }} value={share?.url} placeholder="generating url..." />
        <IconButton title="copy url" size="small" onClick={handleCopyUrl}>
          <ContentCopyIcon />
        </IconButton>
      </div>
    </div>
  );
};
