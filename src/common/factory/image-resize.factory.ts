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
import { ContentSettingsStore } from '../../content-script/store/content-settings.store';
import { ObjRectangleDto } from '../model/obj/obj-utils.dto';

export class ImageResizeFactory {
  static resize = (size: ObjRectangleDto, b64image: string): Promise<string> => {
    const rect = {
      x: size.x,
      y: size.y,
      width: size.width,
      height: Math.min(size.height, window.innerHeight - size.y)
    };
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const can = document.createElement('canvas');
          if (rect.height <= img.naturalHeight) {
            can.width = rect.width;
            can.height = rect.height;
            const ctx = can.getContext('2d');
            ctx?.drawImage(img, rect.x * 2, rect.y * 2, rect.width * 2, rect.height * 2, 0, 0, rect.width, rect.height);
          } else {
            can.width = rect.width;
            can.height = img.naturalHeight / 2 - rect.y;
            const ctx = can.getContext('2d');
            ctx?.drawImage(img, rect.x * 2, rect.y * 2, rect.width * 2, rect.height * 2, 0, 0, rect.width, rect.height);
          }
          b64image = can.toDataURL(
            `image/${ContentSettingsStore.screenshotFormat}`,
            ContentSettingsStore.screenshotQuality
          );
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
      };
      img.src = b64image;
    });
  };
}
