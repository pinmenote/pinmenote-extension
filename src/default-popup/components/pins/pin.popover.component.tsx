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
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { PinObject } from '@common/model/pin.model';

interface PinPopOver {
  visible: boolean;
  pin: PinObject;
}

export const PinPopOver: FunctionComponent<PinPopOver> = ({ pin, visible }) => {
  const ref = useRef<HTMLDivElement>(null);
  const img = new Image();

  useEffect(() => {
    img.width = 280;
    if (pin.screenshot) img.src = pin.screenshot;
    ref.current?.appendChild(img);
    return () => {
      ref.current?.removeChild(img);
    };
  });

  return (
    <div
      style={{
        width: '290px',
        padding: 5,
        marginLeft: 5,
        position: 'relative',
        display: visible ? 'inline-block' : 'none'
      }}
    >
      <div>{pin.value}</div>
      <div ref={ref}></div>
    </div>
  );
};
