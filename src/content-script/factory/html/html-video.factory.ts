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
import { HtmlComputeParams, HtmlIntermediateData } from '../../model/html.model';
import { ContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class HtmlVideoFactory {
  static captureVideo(params: HtmlComputeParams): HtmlIntermediateData {
    const ref = params.ref as HTMLVideoElement;
    let imgData = '';

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

    const hash = fnSha256(imgData);

    params.contentCallback({
      hash,
      type: ContentTypeDto.IMG,
      content: {
        src: imgData
      }
    });
    return {
      html: html,
      assets: [hash]
    };
  }
}
