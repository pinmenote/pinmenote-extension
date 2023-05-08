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
import { ObjContentDto, ObjContentTypeDto } from '../../../common/model/obj/obj-content.dto';
import { HtmlAttrFactory } from './html-attr.factory';
import { HtmlImgFactory } from './html-img.factory';
import { HtmlIntermediateData } from '../../../common/model/html.model';
import { fnUid } from '../../../common/fn/uid.fn';

export class HtmlPictureFactory {
  static computePicture = async (
    ref: HTMLPictureElement,
    forShadow: boolean,
    skipUrlCache?: Set<string>
  ): Promise<HtmlIntermediateData> => {
    if (!ref.firstElementChild) return HtmlAttrFactory.EMPTY_RESULT;

    const children = Array.from(ref.children);
    const img = children.filter((c) => c.tagName.toLowerCase() === 'img').pop();
    const sources = children.filter((c) => c.tagName.toLowerCase() === 'source');

    const content: ObjContentDto[] = [];
    let html = `<picture `;
    html += await HtmlAttrFactory.computeAttrValues('picture', Array.from(ref.attributes));
    html = html.substring(0, html.length - 1);

    // Source must be converted to img - we lose size information that's why we need to put style with those attributes
    html += '>';
    let child = sources.shift();
    while (child) {
      if (child.getAttribute('src') || child.getAttribute('srcset')) {
        break;
      }
      child = sources.shift();
    }
    let value = '';
    if (child) {
      value = await HtmlImgFactory.computeImgValue(child as HTMLImageElement, skipUrlCache);
    } else {
      value = await HtmlImgFactory.computeImgValue(img as HTMLImageElement, skipUrlCache);
    }
    const uid = fnUid();
    if (forShadow) {
      html += `<img src="${value}" `;
    } else {
      html += `<img data-pin-id=${uid} `;
      content.push({
        id: uid,
        type: ObjContentTypeDto.IMG,
        content: value
      });
    }
    if (!child) {
      const imgAttr = Array.from(img.attributes);
      html += await HtmlAttrFactory.computeAttrValues('img', imgAttr);
    } else {
      const imgAttr = Array.from(child.attributes);
      html += await HtmlAttrFactory.computeAttrValues('img', imgAttr);
      if (img) {
        const rect = img.getBoundingClientRect();
        let w = parseInt(img.getAttribute('width') || '0');
        let h = parseInt(img.getAttribute('height') || '0');
        if (rect.height > h) {
          w = rect.width;
          h = rect.height;
        }
        html += `width="${w}" height="${h}" `;
      }
    }
    html = html.substring(0, html.length - 1) + '/>';
    html += '</picture>';
    return {
      html,
      video: [],
      content
    };
  };
}
