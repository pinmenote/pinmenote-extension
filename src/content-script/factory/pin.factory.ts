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
import { HtmlContent, ObjectTypeDto } from '../../common/model/html.model';
import { PinObject, PinViewType } from '../../common/model/pin.model';
import { HtmlFactory } from './html.factory';
import { ObjNextIdCommand } from '../../common/command/obj/id/obj-next-id.command';
import { ObjPagePinDto } from '../../common/model/obj-pin.model';
import { PinAddCommand } from '../../common/command/pin/pin-add.command';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { contentPinNewUrl } from '../../common/fn/pin/content-pin-new-url';
import { fnUid } from '../../common/fn/uid.fn';

export class PinFactory {
  static objPagePinNew = (ref: HTMLElement): ObjPagePinDto => {
    const theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'drak';
    return {
      theme,
      xpath: XpathFactory.newXPathString(ref),
      value: '',
      url: contentPinNewUrl(),
      html: [HtmlFactory.computePinHTMLData(ref)],
      video: [],
      draw: []
    };
  };
  static contentPinNew = async (ref: HTMLElement): Promise<PinObject> => {
    // Roll back border to take snapshot
    const uid = fnUid();
    // const locator: LinkLocator = PinFactory.computeLinkLocator(ref);
    const content: HtmlContent = HtmlFactory.computeHtmlContent(ref);
    const dt = new Date().toISOString();
    const id = await new ObjNextIdCommand().execute();
    const xpath = XpathFactory.newXPathString(ref);
    const rect = XpathFactory.computeRect(ref);
    const dto: PinObject = {
      id,
      uid,
      type: ObjectTypeDto.Pin,
      version: 1,
      visible: true,
      createdAt: dt,
      updatedAt: dt,
      viewType: PinViewType.SCREENSHOT,
      url: contentPinNewUrl(),
      xpath,
      rect,
      content,
      value: '',
      border: {
        radius: ref.style.borderRadius,
        style: ref.style.border
      }
    };
    dto.screenshot = await ScreenshotFactory.takeScreenshot(dto.rect);
    await new PinAddCommand(dto).execute();
    return dto;
  };
}
