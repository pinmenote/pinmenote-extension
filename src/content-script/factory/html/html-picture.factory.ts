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
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnUid } from '../../../common/fn/uid.fn';

export class HtmlPictureFactory {
  static computePicture = async (
    ref: HTMLPictureElement,
    forShadow: boolean,
    skipUrlCache?: Set<string>
  ): Promise<HtmlIntermediateData> => {
    fnConsoleLog('HtmlPictureFactory->computePicture');
    if (!ref.firstElementChild) return HtmlAttrFactory.EMPTY_RESULT;

    const children = Array.from(ref.children);
    // TODO use source - pick best one - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
    const img = children.filter((c) => c.tagName.toLowerCase() === 'img').pop();
    if (!img) return HtmlAttrFactory.EMPTY_RESULT;

    const content: ObjContentDto[] = [];
    let html = `<picture `;
    html += await HtmlAttrFactory.computeAttrValues('picture', Array.from(ref.attributes));
    html = html.substring(0, html.length - 1);

    html += '>';
    const value = await HtmlImgFactory.computeImgValue(img as HTMLImageElement, skipUrlCache);
    if (forShadow) {
      html += `<img src="${value}" `;
    } else {
      const uid = fnUid();
      html += `<img data-pin-id=${uid} `;
      content.push({
        id: uid,
        type: ObjContentTypeDto.IMG,
        content: value
      });
    }
    if (img) {
      const imgAttr = Array.from(img.attributes);
      html += await HtmlAttrFactory.computeAttrValues('img', imgAttr);
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
