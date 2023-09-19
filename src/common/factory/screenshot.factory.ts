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
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../model/bus.model';
import { ImageResizeFactory, ScreenshotSettings } from './image-resize.factory';
import { ObjRectangleDto, ObjSizeDto } from '../model/obj/obj-utils.dto';
import { ObjUrlDto } from '../model/obj/obj.dto';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../fn/fn-console';

export class ScreenshotFactory {
  static readonly THUMB_SETTINGS: ScreenshotSettings = {
    screenshotFormat: 'jpeg',
    screenshotQuality: 80
  };

  static readonly THUMB_SIZE: ObjSizeDto = {
    width: 640,
    height: 360
  };
  static takeScreenshot = async (
    doc: Document,
    win: Window,
    settings: ScreenshotSettings,
    rect?: ObjRectangleDto,
    url?: ObjUrlDto
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Crop screenshot function
      TinyDispatcher.getInstance().addListener<string>(
        BusMessageType.CONTENT_TAKE_SCREENSHOT,
        async (event: string, key: string, screenshot: string) => {
          TinyDispatcher.getInstance().removeListener(event, key);
          if (rect) screenshot = await ImageResizeFactory.resize(doc, win, settings, rect, screenshot);
          resolve(screenshot);
        }
      );
      this.sendTakeScreenshot(reject, url);
    });
  };

  private static sendTakeScreenshot = (reject: (value: string) => void, url?: ObjUrlDto) => {
    BrowserApi.sendRuntimeMessage<ObjUrlDto | undefined>({
      type: BusMessageType.CONTENT_TAKE_SCREENSHOT,
      data: url
    })
      .then(() => {
        // We handle it above, inside dispatcher
      })
      .catch((e: any) => {
        fnConsoleLog('ScreenshotFactory->sendTakeScreenshot->error', e);
        reject('PROBLEM !!!');
      });
  };
}
