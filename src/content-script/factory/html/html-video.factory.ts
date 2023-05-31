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
import { HtmlIntermediateData } from '../../model/html.model';
import { ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class HtmlVideoFactory {
  static captureVideo(ref: HTMLVideoElement): HtmlIntermediateData {
    let imgData = '';

    const hash = fnSha256(imgData);

    const can = document.createElement('canvas');
    can.width = ref.videoWidth;
    can.height = ref.videoHeight;
    const ctx = can.getContext('2d');
    if (ctx) ctx.drawImage(ref, 0, 0);

    imgData = can.toDataURL('image/png', 80);

    let width = ref.getAttribute('width');
    let height = ref.getAttribute('height');

    if (!width || !height) {
      const rect = ref.getBoundingClientRect();
      width = rect.width.toString() || '100%';
      height = rect.height.toString() || '100%';
    }
    // @vane not img because we break pin xpath
    let html = `<video poster="${imgData}" width="${width}" height="${height}" `;

    const style = ref.getAttribute('style') || '';
    if (style) html += `style="${style}" `;

    const clazz = ref.getAttribute('class') || '';
    if (clazz) html += `class="${clazz}" `;

    html += `/>`;

    return {
      html: html,
      content: [
        {
          hash,
          type: ObjContentTypeDto.IMG,
          content: imgData
        }
      ]
    };
  }
}
