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
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinListElement } from './pin-list-element.component';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';

interface PinListProps {
  pinList: ObjDto<ObjPagePinDto>[];
  visibility: boolean;
}

export const PinListComponent: FunctionComponent<PinListProps> = ({ pinList, visibility }) => {
  const [reRender, setReRender] = useState(false);

  useEffect(() => {
    const removeKey = TinyEventDispatcher.addListener<ObjDto<ObjPagePinDto>>(
      BusMessageType.POP_PIN_REMOVE,
      (event, key, value) => {
        if (value.data.snapshot.url.href === pinList[0].data.snapshot.url.href) {
          for (let i = 0; i < pinList.length; i++) {
            const pin = pinList[i];
            if (pin.id === value.id) {
              pinList.splice(i, 1);
              break;
            }
          }
          // Refresh state so component re-renders
          setReRender(!reRender);
        }
      }
    );
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POP_PIN_REMOVE, removeKey);
    };
  });

  // Render pins
  const pins: React.ReactNode[] = [];
  for (const pin of pinList) {
    pins.push(<PinListElement visibility={visibility} key={pin.id} pin={pin} />);
  }
  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>{pins}</div>
    </div>
  );
};
