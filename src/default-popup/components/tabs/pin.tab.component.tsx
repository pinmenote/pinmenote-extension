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
import { PinObject, PinPopupInitData } from '@common/model/pin.model';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ActiveTabStore } from '../../store/active-tab.store';
import { BusMessageType } from '@common/model/bus.model';
import { PinBoardButton } from '../pins/pin.board.button';
import { PinConnectionErrorComponent } from '../pins/pin.connection.error.component';
import { PinCreateComponent } from '../pins/pin.create.component';
import { PinListOriginComponent } from '../pins/pin.list.origin.component';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import { sendRuntimeMessage } from '@common/message/runtime.message';
import PinUrl = Pinmenote.Pin.PinUrl;

export const PinTabComponent: FunctionComponent = () => {
  const [url, setUrl] = useState<PinUrl | undefined>(ActiveTabStore.url);
  const [isError, setIsError] = useState<boolean>(ActiveTabStore.showErrorText);
  const [originPins, setOriginPins] = useState<PinObject[]>(ActiveTabStore.originPins);
  const [hrefPins, setHrefPins] = useState<PinObject[]>(ActiveTabStore.hrefPins);

  useEffect(() => {
    const originKey = TinyEventDispatcher.addListener<PinObject[]>(
      BusMessageType.POPUP_PIN_GET_ORIGIN,
      (event, key, value) => {
        ActiveTabStore.originPins = value;
        setOriginPins(value);
      }
    );
    const hrefKey = TinyEventDispatcher.addListener<PinObject[]>(
      BusMessageType.POPUP_PIN_GET_HREF,
      (event, key, value) => {
        ActiveTabStore.hrefPins = value;
        setHrefPins(value);
      }
    );
    const urlKey = TinyEventDispatcher.addListener<PinPopupInitData>(
      BusMessageType.POPUP_INIT,
      async (event, key, value) => {
        setUrl(ActiveTabStore.url);
        setIsError(ActiveTabStore.showErrorText);
        if (value.url) await fillPinData(value.url);
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_PIN_GET_ORIGIN, originKey);
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_PIN_GET_HREF, hrefKey);
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_INIT, urlKey);
    };
  });

  const fillPinData = async (url: PinUrl) => {
    await sendRuntimeMessage<PinUrl>({
      type: BusMessageType.POPUP_PIN_GET_ORIGIN,
      data: url
    });
    await sendRuntimeMessage<PinUrl>({
      type: BusMessageType.POPUP_PIN_GET_HREF,
      data: url
    });
  };

  return (
    <div style={{ marginTop: 10, height: '100%' }}>
      {isError ? (
        <PinConnectionErrorComponent />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
            <PinCreateComponent />
            {/* marginBottom:155 if test code is uncommented */}
            <div style={{ wordBreak: 'break-word', overflow: 'auto', marginBottom: 110, marginTop: 10 }}>
              <PinListOriginComponent pinOrigin={originPins} pinHref={hrefPins} origin={url?.origin || ''} />
            </div>
          </div>
          <PinBoardButton />
        </div>
      )}
    </div>
  );
};
