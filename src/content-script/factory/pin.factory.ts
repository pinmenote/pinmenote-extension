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
import { ObjPinDto, PinBorderDataDto } from '../../common/model/obj/obj-pin.dto';
import { ObjCanvasDto } from '../../common/model/obj/obj-snapshot.dto';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { ObjUrlDto } from '../../common/model/obj/obj.dto';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { fnSha256 } from '../../common/fn/fn-sha256';

export class PinFactory {
  static objPagePinNew = async (
    url: ObjUrlDto,
    ref: HTMLElement,
    border: PinBorderDataDto,
    canvas?: ObjCanvasDto
  ): Promise<ObjPinDto> => {
    const rect = canvas ? canvas.rect : XpathFactory.computeRect(ref);
    const screenshot = await ScreenshotFactory.takeScreenshot(rect, url);
    const xpath = XpathFactory.newXPathString(ref);
    return {
      xpath,
      screenshot,
      hash: fnSha256(url.href + xpath),
      url,
      border,
      canvas,
      title: ref.innerText.substring(0, 20) || ref.getAttribute('alt') || document.title,
      comments: {
        data: []
      },
      draw: {
        data: []
      }
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
