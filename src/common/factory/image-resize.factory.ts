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
import { ObjRectangleDto } from '../model/obj/obj-utils.dto';
import { PinDocument } from '../components/pin/model/pin-view.model';
import { fnConsoleLog } from '../fn/fn-console';

export class ImageResizeFactory {
  static resize = (doc: PinDocument, size: ObjRectangleDto, b64image: string): Promise<string> => {
    const rect = {
      x: size.x,
      y: size.y,
      width: size.width,
      height: Math.min(size.height, doc.window.innerHeight - size.y)
    };
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const can = doc.document.createElement('canvas');
          can.width = rect.width;
          can.height = rect.height;
          const wr = img.naturalWidth / doc.window.innerWidth;
          const hr = img.naturalHeight / doc.window.innerHeight;
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
          b64image = can.toDataURL(`image/${doc.settings.screenshotFormat}`, doc.settings.screenshotQuality);
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
