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
import { fnFetchImage } from '../../../common/fn/fetch-image.fn';

export class HtmlImgFactory {
  static computeImgValue = async (
    ref: HTMLImageElement | HTMLSourceElement,
    skipUrlCache?: Set<string>
  ): Promise<string> => {
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
    if (ref.getAttribute('lazy-source') && value === '') {
      value = ref.getAttribute('lazy-source') || '';
    }

    value = value.replaceAll('"', '&quot;');

    const url = fnComputeUrl(value);

    if (skipUrlCache?.has(url)) return url;

    const imageData = await fnFetchImage(url);
    if (imageData.ok) {
      return imageData.res;
    } else {
      skipUrlCache?.add(url);
    }
    return url;
  };

  private static computeSrcSet = async (srcset: string[]): Promise<string> => {
    // sort by size so it's best image
    if (srcset.length > 1) {
      srcset = srcset.sort((a, b) => {
        a = a.trim().split(' ')[1].trim();
        b = b.trim().split(' ')[1].trim();
        a = a.substring(0, a.length - 1);
        b = b.substring(0, b.length - 1);
        const aa = parseInt(a);
        const bb = parseInt(b);
        if (aa > bb) return -1;
        if (aa < bb) return 1;
        return 0;
      });
    }
    const value = srcset[0].trim().split(' ')[0];
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
