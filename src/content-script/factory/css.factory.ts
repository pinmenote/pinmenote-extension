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
import { FetchResponse, ResponseType } from '../../common/model/api.model';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { ContentSettingsStore } from '../store/content-settings.store';
import { FetchCssRequest } from '../../common/model/obj-request.model';
import { HtmlComputeParams } from '../model/html.model';
import { SegmentTypeDto } from '../../common/model/obj/page-segment.dto';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { fnComputeUrl } from '../../common/fn/fn-compute-url';
import { fnConsoleLog } from '../../common/fn/fn-console';
import { fnFetchImage } from '../../common/fn/fn-fetch-image';
import { fnSha256 } from '../../common/fn/fn-sha256';

export const CSS_URL_REG = new RegExp('url\\(.*?\\)', 'ig');
export const CSS_IMPORT_REG = new RegExp(
  '(?:@import)(?:\\s)(?:url)?(?:(?:(?:\\()(["\'])?(?:[^"\')]+)\\1(?:\\))|(["\'])(?:.+)\\2)(?:[A-Z\\s])*)+(?:;)',
  'gi'
);
export const STRIP_MASK_REG = new RegExp('(-webkit-mask:url|mask:url)(.*?;)', 'g');
export const STRIP_FONT_REG = new RegExp('(@font-face)(.*?})', 'g');
export const STRIP_URL_IMPORT_REG = new RegExp('[()\'";]', 'g');

export class CssFactory {
  static computeCssContent = async (document: Document, params: HtmlComputeParams): Promise<string[]> => {
    const cssHash: string[] = [];
    const styleSheets = Array.from(document.styleSheets);
    fnConsoleLog('CssFactory->computeCssContent', styleSheets.length);

    for (let i = 0; i < styleSheets.length; i++) {
      const s = styleSheets[i];
      fnConsoleLog('CssFactory->computeCssContent', i, 'out of', styleSheets.length, '', s.href);
      if (s.href) {
        // skip
        if (params.skipUrlCache.has(s.href)) continue;

        const href = fnComputeUrl(s.href);
        const cssFetchData = await this.fetchCss(href);
        if (cssFetchData.ok) {
          const imports = await this.fetchImports(cssFetchData.res, params, href);

          let data = cssFetchData.res.replace(CSS_IMPORT_REG, '').trim();
          data = await this.fetchUrls(data, params, href);
          cssHash.push(...imports);
          if (!data) continue;
          const hash = fnSha256(data);
          cssHash.push(hash);
          params.contentCallback({
            type: SegmentTypeDto.CSS,
            hash,
            content: {
              href: s.href,
              media: s.media.mediaText,
              data
            }
          });
        } else {
          params.skipUrlCache.add(s.href);
          fnConsoleLog('CssFactory->computeCssContent->fail', s.href);
        }
      } else {
        const selectors = await this.computeSelectorRules(s, params);
        cssHash.push(...selectors);
      }
    }
    // fnConsoleLog('CssFactory->computeCssContent', css);
    return cssHash;
  };

  private static computeSelectorRules = async (
    stylesheet: CSSStyleSheet,
    params: HtmlComputeParams
  ): Promise<string[]> => {
    const cssHash: string[] = [];
    let out = '';
    const cssRules = Array.from(stylesheet.cssRules) as any[];
    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-plus-operands */
    for (const r of cssRules) {
      if (r.media) {
        // TODO - optimize that ( ok for now ) - look at old source from repo
        let data = r.cssText;
        const imports = await this.fetchImports(data, params, undefined);
        data = data.replaceAll(CSS_IMPORT_REG, '').trim();
        cssHash.push(...imports);
        out += data + '\n';
      } else if (r.selectorText) {
        let data = r.cssText;
        const imports = await this.fetchImports(data, params, undefined);
        data = data.replaceAll(CSS_IMPORT_REG, '').trim();
        cssHash.push(...imports);
        out += data + '\n';
      } else if (r instanceof CSSSupportsRule || r instanceof CSSContainerRule || r instanceof CSSKeyframesRule) {
        out += r.cssText + '\n';
      } else {
        // TODO parse other rules ex CSSKeyframesRule
        // fnConsoleLog('CssFactory->computeSelectorRules->SKIP', r);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-plus-operands */
    if (!out) return [];
    const hash = fnSha256(out);
    cssHash.push(hash);
    params.contentCallback({
      hash,
      type: SegmentTypeDto.CSS,
      content: {
        data: out,
        media: stylesheet.media.mediaText
      }
    });
    return cssHash;
  };

  static computeAdoptedStyleSheets = (adoptedStyleSheets: CSSStyleSheet[]): string => {
    // TODO - probably we need javascript for that so we don't override styles ??? At least it's now working for m$n.com - micro$oft as always breaks web
    // better than chrome once again ^^
    let out = '';
    for (let i = 0; i < adoptedStyleSheets.length; i++) {
      const sheet = adoptedStyleSheets[i];
      for (let j = 0; j < sheet.cssRules.length; j++) {
        //eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-call
        out += sheet.cssRules[j].cssText + '\n';
      }
    }
    return out;
  };

  static fetchImports = async (
    css: string,
    params: HtmlComputeParams,
    baseUrl?: string,
    forShadow = false
  ): Promise<string[]> => {
    const importList = css.match(CSS_IMPORT_REG);
    if (!importList) return [];

    const out: string[] = [];

    for (const importUrl of importList) {
      if (importUrl.startsWith('http')) continue;
      let url = importUrl.split(' ')[1];
      if (url.startsWith('url')) {
        const urlMatch = url.match(CSS_URL_REG);
        if (!urlMatch) continue;
        url = urlMatch[0].substring(3, urlMatch[0].length - 1);
      }
      url = url.replaceAll(STRIP_URL_IMPORT_REG, '');

      if (baseUrl && !url.startsWith('http')) {
        url = new URL(url, baseUrl).href;
        fnConsoleLog('CssFactory->fetchImports->REL !!!', 'baseUrl', baseUrl, 'url', url);
      } else {
        url = fnComputeUrl(url);
      }

      // skip
      if (params.skipUrlCache.has(url)) continue;

      const result = await this.fetchCss(url);

      if (result.ok) {
        // !important recurrence of getting imports inside imports here
        let res = result.res;
        const imports = await this.fetchImports(result.res, params);
        res = res.replaceAll(CSS_IMPORT_REG, '').trim();
        out.push(...imports);
        // Now fetch urls to save offline
        const data = await this.fetchUrls(res, params, baseUrl);
        // TODO check if should skip this one
        if (!data) continue;
        if (forShadow) {
          out.push(data);
        } else {
          const hash = fnSha256(data);
          out.push(hash);
          params.contentCallback({
            hash,
            type: SegmentTypeDto.CSS,
            content: {
              href: result.url,
              media: '',
              data
            }
          });
        }
      } else {
        params.skipUrlCache.add(url);
        // fnConsoleLog('CssFactory->fetchImports->ERROR !!!', importUrl, url);
      }
    }
    return out;
  };

  static fetchUrls = async (css: string, params: HtmlComputeParams, baseurl?: string): Promise<string> => {
    const urlList = css.match(CSS_URL_REG);
    if (!urlList) return css;

    const a = Array.from(urlList);
    for (let i = 0; i < a.length; i++) {
      const urlMatch = a[i];
      fnConsoleLog('CssFactory->fetchUrls', i, 'of', a.length);
      let url = urlMatch.substring(3, urlMatch.length - 1);

      url = url.replaceAll(STRIP_URL_IMPORT_REG, '');

      // TODO verify it's ok
      if (url.startsWith('data:image/svg+xml;charset=utf8') || url.startsWith('data:image/svg+xml;utf8')) {
        css = css.replace(urlMatch, encodeURI(url));
        continue;
      }
      // skip data elements
      if (url.startsWith('data:')) continue;
      // skip url with #
      if (url.startsWith('#')) continue;
      // TODO fix - for now skip multiple urls
      if (url.split('url(').length > 2) continue;
      if (
        !(
          url.endsWith('.gif') ||
          url.endsWith('.png') ||
          url.endsWith('.jpg') ||
          url.endsWith('.jpeg') ||
          url.endsWith('.webp')
        )
      )
        continue;
      if (baseurl && !url.startsWith('http')) {
        url = new URL(url, baseurl).href;
      } else {
        url = fnComputeUrl(url);
      }

      if (params.skipUrlCache.has(url)) continue;

      if (params.visitedUrl[url]) {
        const newUrl = `url(${params.visitedUrl[url]})`;
        css = css.replace(urlMatch, newUrl);
      } else {
        const result = await fnFetchImage(url, ContentSettingsStore.skipCssImageSize);

        if (result.ok) {
          const newUrl = `url(${result.res})`;
          css = css.replace(urlMatch, newUrl);

          params.visitedUrl[url] = result.res;
        } else {
          // fnConsoleLog('CssFactory->fetchUrl->ERROR !!!', result, baseurl);
          params.skipUrlCache.add(url);
        }
      }
    }
    // Remove masks because I don't have time and money for now to parse all css types of urls
    // Invalid url inside mask results with empty image
    css = css.replaceAll(STRIP_MASK_REG, '');
    // Strip font face because we don't load it - fonts are big
    css = css.replaceAll(STRIP_FONT_REG, '');
    return css;
  };

  static fetchCss(url: string): Promise<FetchResponse<string>> {
    fnConsoleLog('CssFactory->fetchCss', url);
    return new Promise<FetchResponse<string>>((resolve) => {
      const fetchKey = TinyEventDispatcher.addListener<FetchResponse<string>>(
        BusMessageType.CONTENT_FETCH_CSS,
        (event, key, value) => {
          // fnConsoleLog('CssFactory->fetchCss->CONTENT_FETCH_CSS', value);
          if (value.url === url) {
            TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_CSS, key);
            resolve(value);
          }
        }
      );
      BrowserApi.sendRuntimeMessage<FetchCssRequest>({
        type: BusMessageType.CONTENT_FETCH_CSS,
        data: {
          url
        }
      })
        .then(() => {
          /* SKIP */
        })
        .catch((e) => {
          fnConsoleLog('Error CssFactory->fetchCss', e);
          TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_CSS, fetchKey);
          resolve({ ok: false, url, res: '', status: 500, type: ResponseType.TEXT });
        });
    });
  }
}
