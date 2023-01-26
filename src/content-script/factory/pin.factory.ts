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
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { HtmlFactory } from './html.factory';
import { ImageResizeFactory } from '../../common/factory/image-resize.factory';
import { ObjNextIdCommand } from '../../common/command/obj/id/obj-next-id.command';
import { ObjPagePinDto } from '../../common/model/obj-pin.model';
import { PinAddCommand } from '../../common/command/pin/pin-add.command';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { contentPinNewUrl } from '../../common/fn/pin/content-pin-new-url';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnUid } from '../../common/fn/uid.fn';

export class PinFactory {
  static objPagePinNew = (ref: HTMLElement): ObjPagePinDto => {
    const theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'drak';
    const xpath = XpathFactory.newXPathString(ref);
    const htmlData = HtmlFactory.computePinHTMLData(ref);
    return {
      title: document.title,
      theme,
      xpath,
      url: contentPinNewUrl(),
      html: [htmlData],
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
    return new Promise((resolve, reject) => {
      // Crop screenshot function
      TinyEventDispatcher.addListener<string>(
        BusMessageType.CONTENT_TAKE_SCREENSHOT,
        async (event: string, key: string, value: string) => {
          TinyEventDispatcher.removeListener(event, key);
          await PinFactory.addNewPinWithScreenshot(dto, value, resolve);
        }
      );
      PinFactory.sendGetPinTakeScreenshot(reject);
    });
  };

  static sendGetPinTakeScreenshot = (reject: (value: string) => void) => {
    BrowserApi.sendRuntimeMessage<undefined>({
      type: BusMessageType.CONTENT_TAKE_SCREENSHOT
    })
      .then(() => {
        // We handle it above, inside dispatcher
      })
      .catch((e) => {
        fnConsoleLog('PROBLEM sendGetPinTakeScreenshot !!!', e);
        reject('PROBLEM !!!');
      });
  };

  private static addNewPinWithScreenshot = async (
    dto: PinObject,
    screenshot: string,
    resolve: (value: PinObject) => void
  ): Promise<void> => {
    // Let's resize screenshot and resolve promise
    try {
      screenshot = await ImageResizeFactory.resize(dto.rect, screenshot);
    } finally {
      dto.screenshot = screenshot;
    }
    await new PinAddCommand(dto).execute();
    resolve(dto);
  };
}
