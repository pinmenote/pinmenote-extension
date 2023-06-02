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
import { HtmlComputeParams } from './html.factory';
import { HtmlImgFactory } from './html-img.factory';
import { HtmlIntermediateData } from '../../model/html.model';
import { fnFetchImage } from '../../../common/fn/fn-fetch-image';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class HtmlPictureFactory {
  static computePicture = async (
    ref: HTMLPictureElement,
    forShadow: boolean,
    params: HtmlComputeParams
  ): Promise<HtmlIntermediateData> => {
    // fnConsoleLog('HtmlPictureFactory->computePicture');
    if (!ref.firstElementChild) return HtmlAttrFactory.EMPTY_RESULT;

    const img = ref.querySelector('img');
    let imgValue = undefined;
    if (img && img.currentSrc) {
      if (params.visitedUrl[img.currentSrc]) {
        imgValue = params.visitedUrl[img.currentSrc];
      } else {
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
        // Compute picture as img to cache source as base64 encoded string inside img tag
        // TODO still need fix for not rendered images - this is half baked
        const imageData = await fnFetchImage(img.currentSrc);
        if (imageData.ok) {
          imgValue = imageData.res;
          params.visitedUrl[img.currentSrc] = imgValue;
        }
      }
    } else if (!img) {
      return HtmlAttrFactory.EMPTY_RESULT;
    }

    if (!imgValue) imgValue = await HtmlImgFactory.computeImgValue(img, params);
    if (!imgValue) return HtmlAttrFactory.EMPTY_RESULT;

    const content: ObjContentDto[] = [];
    let html = `<picture `;
    const picAttrs = await HtmlAttrFactory.computeAttrValues('picture', Array.from(ref.attributes), params);
    html += picAttrs.substring(0, picAttrs.length - 1) + '>';

    if (forShadow) {
      // TODO hash for shadow
      html += `<img src="${imgValue}" `;
    } else {
      const hash = fnSha256(imgValue);
      html += `<img data-pin-hash="${hash}" `;
      content.push({
        hash,
        type: ObjContentTypeDto.IMG,
        content: imgValue
      });
    }

    html += await HtmlAttrFactory.computeAttrValues('img', Array.from(img.attributes), params);
    html += ' /></picture>';

    return {
      html,
      content
    };
  };
}
