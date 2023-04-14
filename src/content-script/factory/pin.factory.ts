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
import { ObjCanvasDto, ObjSnapshotDto } from '../../common/model/obj/obj-snapshot.dto';
import { ObjPagePinDto, PinBorderDataDto } from '../../common/model/obj/obj-pin.dto';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { XpathFactory } from '../../common/factory/xpath.factory';

export class PinFactory {
  static objPagePinNew = (ref: HTMLElement, snapshot: ObjSnapshotDto, border: PinBorderDataDto): ObjPagePinDto => {
    return {
      xpath: XpathFactory.newXPathString(ref),
      border,
      snapshot,
      comments: {
        data: []
      },
      draw: []
    };
  };

  static objCanvasPinNew = (rect: ObjRectangleDto): ObjCanvasDto => {
    return {
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      rect
    };
  };
}
