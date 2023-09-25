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
export const fnB64toBlob = (b64Data: string, sliceSize = 512): Blob => {
  const a = b64Data.split(',');
  const b = a[0].substring(5).split(';');
  const contentType = b[0];
  if (b[1] === 'base64') return b64ToBlob(a[1], contentType, sliceSize);
  if (['utf8', 'charset=utf8', 'charset=utf-8', undefined].includes(b[1]))
    return new Blob([a[1]], { type: contentType });
  throw new Error(`Unsupported content type ${contentType} - ${b[1]}`);
};

const b64ToBlob = (data: string, contentType: string, sliceSize: number): Blob => {
  if (data.endsWith('%3D')) data = data.replaceAll('%3D', '=');
  const byteCharacters = atob(data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};
