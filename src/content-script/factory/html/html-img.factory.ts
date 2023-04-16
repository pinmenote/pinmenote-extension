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
import { fnComputeUrl } from '../../../common/fn/compute-url.fn';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnFetchImage } from '../../../common/fn/fetch-image.fn';

export class HtmlImgFactory {
  static computeImgValue = async (ref: HTMLImageElement | HTMLSourceElement): Promise<string> => {
    let value = ref.src || '';
    // we have data already inside image so just add it
    if (value.startsWith('data:')) {
      return value;
    }

    // fnConsoleLog('HtmlFactory->computeImgValue', ref.src);
    // data-src
    if (ref.getAttribute('data-src')) {
      value = ref.getAttribute('data-src') || '';
      const url = fnComputeUrl(value);
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        return imageData.res;
      }
    }

    // data-pin-media - maybe merge with data-src
    if (ref.getAttribute('data-pin-media')) {
      value = ref.getAttribute('data-pin-media') || '';
      const url = fnComputeUrl(value);
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        return imageData.res;
      }
    }

    // srcset
    if (ref.srcset) {
      // TODO check if ok for all cases - pick best image based on second parameter
      return await this.computeSrcSet(ref.srcset.split(', '));
    }
    if (ref.getAttribute('data-srcset')) {
      const srcset = ref.getAttribute('data-srcset') || '';
      return await this.computeSrcSet(srcset.split(', '));
    }

    value = value.replaceAll('"', '&quot;');

    const url = fnComputeUrl(value);

    const imageData = await fnFetchImage(url);
    if (imageData.ok) {
      return imageData.res;
    } else {
      fnConsoleLog('HtmlImgFactory->computeImgValue', url, imageData, ref);
    }
    return url;
  };

  private static computeSrcSet = async (srcset: string[]): Promise<string> => {
    // last value so it's biggest image
    const value = srcset[srcset.length - 1].trim().split(' ')[0];
    const url = fnComputeUrl(value);
    if (url.startsWith('http')) {
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        return imageData.res;
      }
    }
    return '';
  };
}
