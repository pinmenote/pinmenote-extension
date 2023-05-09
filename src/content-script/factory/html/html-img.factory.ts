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
  static computeImgValue = async (
    ref: HTMLImageElement | HTMLSourceElement,
    skipUrlCache?: Set<string>
  ): Promise<string> => {
    let value = ref.src || '';

    // yet another problem with some library loading img tags async
    const isAsyncDecoding = ref.getAttribute('decoding') === 'async';

    fnConsoleLog('HtmlImgFactory->computeImgValue', ref);

    // we have data already inside image so just add it except it's not async loading cause might be blank
    if (!isAsyncDecoding && value.startsWith('data:')) {
      fnConsoleLog('HtmlImgFactory->computeImgValue->data');
      return value;
    }

    if (value.startsWith('http')) {
      const imageData = await fnFetchImage(value);
      if (imageData.ok) {
        fnConsoleLog('HtmlImgFactory->computeImgValue->fnFetchImage');
        return imageData.res;
      }
    }

    // data-src
    if (ref.getAttribute('data-src')) {
      value = ref.getAttribute('data-src') || '';
      const url = fnComputeUrl(value);
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        fnConsoleLog('HtmlImgFactory->computeImgValue->data-src');
        return imageData.res;
      }
    }
    //
    if (isAsyncDecoding && ref.getAttribute('data-lazy-src')) {
      value = ref.getAttribute('data-lazy-src') || '';
      const url = fnComputeUrl(value);
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        fnConsoleLog('HtmlImgFactory->computeImgValue->data-lazy-src');
        return imageData.res;
      }
    }

    // data-pin-media - maybe merge with data-src
    if (ref.getAttribute('data-pin-media')) {
      value = ref.getAttribute('data-pin-media') || '';
      const url = fnComputeUrl(value);
      const imageData = await fnFetchImage(url);
      if (imageData.ok) {
        fnConsoleLog('HtmlImgFactory->computeImgValue->data-pin-media');
        return imageData.res;
      }
    }

    // srcset
    if (ref.srcset) {
      // TODO check if ok for all cases - pick best image based on second parameter
      const result = await this.computeSrcSet(ref.srcset.split(', '));
      if (result) return result;
    }

    if (ref.getAttribute('data-lazy-srcset')) {
      const srcset = ref.getAttribute('data-lazy-srcset') || '';
      const result = await this.computeSrcSet(srcset.split(', '));
      if (result) return result;
    }

    if (ref.getAttribute('data-srcset')) {
      const srcset = ref.getAttribute('data-srcset') || '';
      const result = await this.computeSrcSet(srcset.split(', '));
      if (result) return result;
    }

    if (ref.getAttribute('lazy-source') && value === '') {
      value = ref.getAttribute('lazy-source') || '';
    }

    value = value.replaceAll('"', '&quot;');

    const url = fnComputeUrl(value);
    fnConsoleLog('HtmlImgFactory->computeImgValue', url);
    if (skipUrlCache?.has(url)) return url;

    const imageData = await fnFetchImage(url);
    if (imageData.ok) {
      fnConsoleLog('HtmlImgFactory->computeImgValue->fnFetchImage');
      return imageData.res;
    } else {
      skipUrlCache?.add(url);
    }
    fnConsoleLog('HtmlImgFactory->computeImgValue->url');
    return url;
  };

  private static computeSrcSet = async (srcset: string[]): Promise<string> => {
    fnConsoleLog('HtmlImgFactory->computeSrcSet');
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
      fnConsoleLog('HtmlImgFactory->computeSrcSet->fetch->complete');
      if (imageData.ok) {
        return imageData.res;
      }
    }
    fnConsoleLog('HtmlImgFactory->computeSrcSet->empty');
    return '';
  };
}
