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
import { ObjPinDto, PinBorderDataDto, PinIframeDto } from '../../common/model/obj/obj-pin.dto';
import { ContentSettingsStore } from '../store/content-settings.store';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { ObjUrlDto } from '../../common/model/obj/obj.dto';
import { PageCanvasDto } from '../../common/model/obj/page-snapshot.dto';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { fnIframeIndex } from '../../common/fn/fn-iframe-index';
import { fnSha256 } from '../../common/fn/fn-hash';

export class PinFactory {
  static objPagePinNew = async (
    url: ObjUrlDto,
    ref: HTMLElement,
    border: PinBorderDataDto,
    isIframe: boolean,
    baseUrl?: ObjUrlDto,
    canvas?: PageCanvasDto
  ): Promise<ObjPinDto> => {
    const rect = canvas ? canvas.rect : XpathFactory.computeRect(ref);
    const screenshot = await ScreenshotFactory.takeScreenshot(
      document,
      window,
      ContentSettingsStore.settings,
      rect,
      url
    );
    const xpath = XpathFactory.newXPathString(ref);
    const iframe: PinIframeDto | undefined = isIframe && baseUrl ? { index: fnIframeIndex(), url: baseUrl } : undefined;
    const hash = fnSha256(url.href + xpath);
    const title = ref.innerText.substring(0, 20) || ref.getAttribute('alt') || document.title;
    return {
      data: {
        hash,
        url,
        xpath,
        screenshot,
        iframe,
        border,
        canvas
      },
      description: {
        hash: fnSha256(title),
        title
      },
      comments: {
        data: []
      },
      draw: {
        data: []
      }
    };
  };

  static objCanvasPinNew = (rect: ObjRectangleDto): PageCanvasDto => {
    return {
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      rect
    };
  };
}
