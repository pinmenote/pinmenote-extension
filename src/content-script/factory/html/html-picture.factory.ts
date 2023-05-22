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
import { HtmlIntermediateData } from '../../model/html.model';
import { fnFetchImage } from '../../../common/fn/fetch-image.fn';
import { fnUid } from '../../../common/fn/uid.fn';

export class HtmlPictureFactory {
  static computePicture = async (
    ref: HTMLPictureElement,
    forShadow: boolean,
    skipUrlCache?: Set<string>
  ): Promise<HtmlIntermediateData> => {
    // fnConsoleLog('HtmlPictureFactory->computePicture');
    if (!ref.firstElementChild) return HtmlAttrFactory.EMPTY_RESULT;

    const img = ref.querySelector('img');
    let imgValue = undefined;
    if (img && img.currentSrc) {
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
      // Compute picture as img to cache source as base64 encoded string inside img tag
      const imageData = await fnFetchImage(img.currentSrc);
      if (imageData.ok) {
        imgValue = imageData.res;
      }
    } else if (!img) {
      return HtmlAttrFactory.EMPTY_RESULT;
    }

    if (!imgValue) imgValue = await HtmlImgFactory.computeImgValue(img, skipUrlCache);

    const content: ObjContentDto[] = [];
    let html = `<picture `;
    const picAttrs = await HtmlAttrFactory.computeAttrValues('picture', Array.from(ref.attributes));
    html += picAttrs.substring(0, picAttrs.length - 1) + '>';

    if (forShadow) {
      html += `<img src="${imgValue}" `;
    } else {
      const uid = fnUid();
      html += `<img data-pin-id=${uid} `;
      content.push({
        id: uid,
        type: ObjContentTypeDto.IMG,
        content: imgValue
      });
    }

    const imgAttr = await HtmlAttrFactory.computeAttrValues('img', Array.from(img.attributes));
    html += imgAttr.substring(0, html.length - 1);
    html += '/></picture>';

    return {
      html,
      video: [],
      content
    };
  };
}
