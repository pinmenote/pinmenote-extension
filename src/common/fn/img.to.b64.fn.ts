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
export const fnImgToBase64 = (src: string): Promise<string> => {
  const img = new Image();
  return new Promise<string>((resolve) => {
    img.onload = () => {
      const can = document.createElement('canvas');
      can.width = img.naturalWidth;
      can.height = img.naturalHeight;
      const ctx = can.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(can.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      resolve('');
    };
    img.crossOrigin = '';
    img.src = src;
  });
};
