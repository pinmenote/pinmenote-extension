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
        fnConsoleLog('ImageResizeFactory->resize2', error);
        window.URL.revokeObjectURL(b64image);
        img.onerror = null;
        img.onload = null;
        reject(error);
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
          const can1 = doc.createElement('canvas');
          const can2 = doc.createElement('canvas');
          can1.width = img.naturalWidth;
          can1.height = img.naturalHeight;
          const wr = img.naturalWidth / win.innerWidth;
          const hr = img.naturalHeight / win.innerHeight;
          can2.width = rect.width * wr;
          can2.height = rect.height * hr;
          const ctx1 = can1.getContext('2d');
          const ctx2 = can2.getContext('2d');
          if (!ctx1 || !ctx2) return;
          ctx1.imageSmoothingEnabled = false;
          ctx2.imageSmoothingEnabled = false;
          ctx1.drawImage(img, 0, 0);
          ctx2.putImageData(ctx1.getImageData(rect.x * wr, rect.y * hr, rect.width * wr, rect.height * hr), 0, 0);
          if (settings.screenshotFormat === 'jpeg') {
            b64image = can2.toDataURL(`image/${settings.screenshotFormat}`, settings.screenshotQuality);
          } else {
            b64image = can2.toDataURL(`image/${settings.screenshotFormat}`, 1);
          }
        } finally {
          window.URL.revokeObjectURL(b64image);
          img.onerror = null;
          img.onload = null;
          // Resolve here
          resolve(b64image);
        }
      };
      img.onerror = (event, source, lineno, colno, error) => {
        fnConsoleLog('ImageResizeFactory->resize', error);
        window.URL.revokeObjectURL(b64image);
        img.onerror = null;
        img.onload = null;
        reject(error);
      };
      img.src = b64image;
    });
  };
}
