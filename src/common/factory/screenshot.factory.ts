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
import { ImageResizeFactory } from './image-resize.factory';
import { ObjRectangleDto } from '../model/obj/obj-utils.dto';
import { ObjUrlDto } from '../model/obj/obj.dto';
import { PinDocument } from '../components/pin/model/pin-view.model';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../fn/fn-console';

export class ScreenshotFactory {
  static takeScreenshot = async (doc: PinDocument, rect?: ObjRectangleDto, url?: ObjUrlDto): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Crop screenshot function
      TinyDispatcher.addListener<string>(
        BusMessageType.CONTENT_TAKE_SCREENSHOT,
        async (event: string, key: string, screenshot: string) => {
          TinyDispatcher.removeListener(event, key);
          if (rect) screenshot = await ImageResizeFactory.resize(doc, rect, screenshot);
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
      .catch((e) => {
        fnConsoleLog('ScreenshotFactory->sendTakeScreenshot->error', e);
        reject('PROBLEM !!!');
      });
  };
}
