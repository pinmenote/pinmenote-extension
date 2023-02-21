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
import { BrowserApi } from '../service/browser.api.wrapper';
import { BusMessageType } from '../model/bus.model';
import { ImageResizeFactory } from './image-resize.factory';
import { ObjRectangleDto } from '../model/obj/obj-utils.dto';
import { ObjUrlDto } from '../model/obj/obj.dto';
import { TinyEventDispatcher } from '../service/tiny.event.dispatcher';
import { fnConsoleLog } from '../fn/console.fn';

export class ScreenshotFactory {
  static takeScreenshot = async (rect?: ObjRectangleDto, url?: ObjUrlDto): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Crop screenshot function
      TinyEventDispatcher.addListener<string>(
        BusMessageType.CONTENT_TAKE_SCREENSHOT,
        async (event: string, key: string, screenshot: string) => {
          TinyEventDispatcher.removeListener(event, key);
          if (rect) screenshot = await ImageResizeFactory.resize(rect, screenshot);
          resolve(screenshot);
        }
      );
      this.sendGetPinTakeScreenshot(reject, url);
    });
  };

  private static sendGetPinTakeScreenshot = (reject: (value: string) => void, url?: ObjUrlDto) => {
    BrowserApi.sendRuntimeMessage<ObjUrlDto | undefined>({
      type: BusMessageType.CONTENT_TAKE_SCREENSHOT,
      data: url
    })
      .then(() => {
        // We handle it above, inside dispatcher
      })
      .catch((e) => {
        fnConsoleLog('PROBLEM sendGetPinTakeScreenshot !!!', e);
        reject('PROBLEM !!!');
      });
  };
}
