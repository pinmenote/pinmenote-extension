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
import { ObjCanvasPinDto, ObjPagePinDto } from '../../common/model/obj/obj-pin.dto';
import { HtmlFactory } from './html.factory';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { UrlFactory } from '../../common/factory/url.factory';
import { XpathFactory } from '../../common/factory/xpath.factory';

export class PinFactory {
  static objPagePinNew = async (ref: HTMLElement): Promise<ObjPagePinDto> => {
    const url = UrlFactory.newUrl();
    const htmlData = await HtmlFactory.computeHtmlData(ref, url);
    return {
      title: document.title,
      xpath: XpathFactory.newXPathString(ref),
      value: '',
      url,
      html: [htmlData],
      video: [],
      draw: []
    };
  };

  static objCanvasPinNew = async (rect: ObjRectangleDto): Promise<ObjCanvasPinDto> => {
    const url = UrlFactory.newUrl();
    const screenshot = await ScreenshotFactory.takeScreenshot(rect, url);
    return {
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      rect,
      screenshot,
      title: document.title,
      value: '',
      url,
      draw: []
    };
  };
}
