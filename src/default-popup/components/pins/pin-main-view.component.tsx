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
import { BusMessageType } from '../../../common/model/bus.model';
import { CreateComponent } from './create/create.component';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinBoardButton } from './pin-board.button';
import { PinListViewComponent } from './pin-list-view.component';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';

export const PinMainViewComponent: FunctionComponent = () => {
  const [originPins, setOriginPins] = useState<ObjDto<ObjPagePinDto>[]>(PopupActiveTabStore.originPins);
  const [hrefPins, setHrefPins] = useState<ObjDto<ObjPagePinDto>[]>(PopupActiveTabStore.hrefPins);

  useEffect(() => {
    const urlKey = TinyEventDispatcher.addListener(BusMessageType.POP_UPDATE_URL, () => {
      setHrefPins(PopupActiveTabStore.hrefPins);
      setOriginPins(PopupActiveTabStore.originPins);
    });
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POP_UPDATE_URL, urlKey);
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <CreateComponent />
        {/* marginBottom:155 if test code is uncommented */}
        <div style={{ wordBreak: 'break-word', overflow: 'auto', marginBottom: 110, marginTop: 10 }}>
          <PinListViewComponent pinOrigin={originPins} pinHref={hrefPins} />
        </div>
      </div>
      <PinBoardButton />
    </div>
  );
};
