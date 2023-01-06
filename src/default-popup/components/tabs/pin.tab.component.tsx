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
import { PinObject, PinPopupInitData } from '../../../common/model/pin.model';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ActiveTabStore } from '../../store/active-tab.store';
import { BusMessageType } from '../../../common/model/bus.model';
import { ObjectCreateComponent } from '../pins/object.create.component';
import { PinBoardButton } from '../pins/pin.board.button';
import { PinConnectionErrorComponent } from '../pins/pin.connection.error.component';
import { PinGetHrefCommand } from '../../../common/command/pin/pin-get-href.command';
import { PinGetOriginCommand } from '../../../common/command/pin/pin-get-origin.command';
import { PinListOriginComponent } from '../pins/pin.list.origin.component';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import PinUrl = Pinmenote.Pin.PinUrl;

export const PinTabComponent: FunctionComponent = () => {
  const [isError, setIsError] = useState<boolean>(ActiveTabStore.showErrorText);
  const [originPins, setOriginPins] = useState<PinObject[]>(ActiveTabStore.originPins);
  const [hrefPins, setHrefPins] = useState<PinObject[]>(ActiveTabStore.hrefPins);

  useEffect(() => {
    const urlKey = TinyEventDispatcher.addListener<PinPopupInitData>(
      BusMessageType.POPUP_INIT,
      async (event, key, value) => {
        setIsError(ActiveTabStore.showErrorText);
        if (value.url) {
          await fillPinData(value.url);
        }
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_INIT, urlKey);
    };
  });

  const fillPinData = async (url: PinUrl) => {
    ActiveTabStore.hrefPins = await new PinGetHrefCommand(url).execute();
    ActiveTabStore.originPins = await new PinGetOriginCommand(url).execute();
    setHrefPins(ActiveTabStore.hrefPins);
    setOriginPins(ActiveTabStore.originPins);
  };

  return (
    <div style={{ marginTop: 10, height: '100%' }}>
      {isError ? (
        <PinConnectionErrorComponent />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
            <ObjectCreateComponent />
            {/* marginBottom:155 if test code is uncommented */}
            <div style={{ wordBreak: 'break-word', overflow: 'auto', marginBottom: 110, marginTop: 10 }}>
              <PinListOriginComponent pinOrigin={originPins} pinHref={hrefPins} />
            </div>
          </div>
          <PinBoardButton />
        </div>
      )}
    </div>
  );
};
