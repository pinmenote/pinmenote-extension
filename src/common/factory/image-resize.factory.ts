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
import { ObjRectangleDto, ObjSizeDto } from '../model/obj/obj-utils.dto';
import { fnConsoleLog } from '../fn/fn-console';
import { ScreenshotFormat } from '../environment';

export interface ScreenshotSettings {
  screenshotFormat: ScreenshotFormat;
  screenshotQuality: number;
}

export class ImageResizeFactory {
  static resize2 = (
    doc: Document,
    settings: ScreenshotSettings,
    size: ObjSizeDto,
    b64image: string
  ): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          if (img.naturalWidth <= size.width && img.naturalHeight <= size.height) resolve(b64image);
          const can = doc.createElement('canvas');
          const wr = size.width / img.naturalWidth;
          const hr = size.height / img.naturalHeight;
          const s = Math.min(wr, hr);
          can.width = img.naturalWidth * s;
          can.height = img.naturalHeight * s;
          const ctx = can.getContext('2d');
          ctx?.drawImage(img, 0, 0, can.width, can.height);
          b64image = can.toDataURL(`image/${settings.screenshotFormat}`, settings.screenshotQuality);
        } finally {
          window.URL.revokeObjectURL(b64image);
          img.onerror = null;
          img.onload = null;
          // Resolve here
          resolve(b64image);
        }
      };
      img.onerror = (event, source, lineno, colno, error) => {
        window.URL.revokeObjectURL(b64image);
        img.onerror = null;
        img.onload = null;
        reject(error);
        fnConsoleLog('ImageResizeFactory->resize', error);
      };
      img.src = b64image;
    });
  };
  static resize = (
    doc: Document,
    win: Window,
    settings: ScreenshotSettings,
    size: ObjRectangleDto,
    b64image: string
  ): Promise<string> => {
    const rect = {
      x: size.x,
      y: size.y,
      width: size.width,
      height: Math.min(size.height, win.innerHeight - size.y)
    };
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const can = doc.createElement('canvas');
          can.width = rect.width;
          can.height = rect.height;
          const wr = img.naturalWidth / win.innerWidth;
          const hr = img.naturalHeight / win.innerHeight;
          const ctx = can.getContext('2d');
          ctx?.drawImage(
            img,
            rect.x * wr,
            rect.y * hr,
            rect.width * wr,
            rect.height * hr,
            0,
            0,
            rect.width,
            rect.height
          );
          b64image = can.toDataURL(`image/${settings.screenshotFormat}`, settings.screenshotQuality);
        } finally {
          window.URL.revokeObjectURL(b64image);
          img.onerror = null;
          img.onload = null;
          // Resolve here
          resolve(b64image);
        }
      };
      img.onerror = (event, source, lineno, colno, error) => {
        window.URL.revokeObjectURL(b64image);
        img.onerror = null;
        img.onload = null;
        reject(error);
        fnConsoleLog('ImageResizeFactory->resize', error);
      };
      img.src = b64image;
    });
  };
}
