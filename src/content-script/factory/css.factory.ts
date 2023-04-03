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
import { CssStyleDto, CssStyleListDto } from '../../common/model/obj/obj-pin.dto';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { FetchCssRequest } from '../../common/model/obj-request.model';
import { FetchResponse } from '../../common/model/api.model';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { fnComputeUrl } from '../../common/fn/compute-url.fn';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnFetchImage } from '../../common/fn/fetch-image.fn';

type ComputeCssRule = CSSStyleRule & CSSRule & CSSGroupingRule & CSSConditionRule & CSSImportRule;

export const CSS_URL_REG = new RegExp('url\\(["\'].*["\']\\)', 'g');
const IMPORT_REG = new RegExp(
  '(?:@import)(?:\\s)(?:url)?(?:(?:(?:\\()(["\'])?(?:[^"\')]+)\\1(?:\\))|(["\'])(?:.+)\\2)(?:[A-Z\\s])*)+(?:;)',
  'gi'
);

export class CssFactory {
  static computeCssContent = async (): Promise<CssStyleListDto> => {
    const css: CssStyleDto[] = [];
    const styleSheets = Array.from(document.styleSheets);
    fnConsoleLog('CssFactory->computeCssContent');

    for (let i = 0; i < styleSheets.length; i++) {
      const s = styleSheets[i];
      if (s.href) {
        const cssFetchData = await this.fetchCss(s.href);

        if (cssFetchData.ok) {
          const imports = await this.fetchImports(cssFetchData.res, s.href);

          let data = cssFetchData.res.replaceAll(IMPORT_REG, '').trim();
          data = await this.fetchUrls(data);
          css.push(...imports);

          css.push({
            href: s.href,
            media: s.media.mediaText,
            data
          });
        } else {
          css.push({
            href: s.href,
            media: s.media.mediaText,
            data: undefined
          });
        }
      } else {
        const selectors = await this.computeSelectorRules(s);
        css.push(...selectors);
      }
    }
    return {
      css
    };
  };

  private static computeSelectorRules = async (stylesheet: CSSStyleSheet): Promise<CssStyleDto[]> => {
    const css: CssStyleDto[] = [];
    const cssRules = Array.from(stylesheet.cssRules) as ComputeCssRule[];
    for (const r of cssRules) {
      if (r.media) {
        // TODO - optimize that ( ok for now ) - look at old source from repo
        let data = r.cssText;
        const imports = await this.fetchImports(data);
        data = data.replaceAll(IMPORT_REG, '').trim();
        css.push(...imports);
        css.push({
          media: r.media.mediaText || stylesheet.media.mediaText,
          data: `@media ${r.conditionText} {
  ${data}
}`
        });
      } else if (r.selectorText) {
        let data = r.cssText;
        const imports = await this.fetchImports(data);
        data = data.replaceAll(IMPORT_REG, '').trim();
        css.push(...imports);
        css.push({
          data,
          media: stylesheet.media.mediaText
        });
      } else {
        // TODO parse other rules ex CSSKeyFrameRules
        // fnConsoleLog('CssFactory->computeSelectorRules->SKIP', r);
      }
    }
    return css;
  };

  private static fetchImports = async (css: string, rel?: string): Promise<CssStyleDto[]> => {
    const importList = css.match(IMPORT_REG);
    if (!importList) return [];

    const out = [];

    for (const importUrl of importList) {
      if (importUrl.startsWith('http')) continue;
      let url = importUrl.split(' ')[1];

      url = url.endsWith(';') ? url.substring(1, url.length - 2) : url.substring(1, url.length - 1);
      if (url.startsWith('url')) {
        const urlMatch = url.match(CSS_URL_REG);
        if (!urlMatch) continue;
        url = urlMatch[0].substring(5, urlMatch[0].length - 2);
        url = fnComputeUrl(url);
      } else if (rel) {
        const a = rel.split('/');
        url = fnComputeUrl(url, a.slice(0, a.length - 1).join('/'));
        fnConsoleLog('CssFactory->fetchImports->REL !!!', url);
      } else {
        url = fnComputeUrl(url);
      }

      const result = await this.fetchCss(url);

      if (result.ok) {
        // Now fetch urls to save offline
        const data = await this.fetchUrls(result.res);
        out.push({
          href: result.url,
          media: '',
          data
        });
      } else {
        fnConsoleLog('CssFactory->fetchImports->ERROR !!!', result, css);
      }
    }
    return out;
  };

  static fetchUrls = async (css: string): Promise<string> => {
    const urlList = css.match(CSS_URL_REG);
    if (!urlList) return css;

    for (const urlMatch of urlList) {
      let url = urlMatch.substring(5, urlMatch.length - 2);
      // skip data elements
      if (url.startsWith('data:')) continue;
      // skip url with #
      if (url.startsWith('#')) continue;
      // skip multiple urls
      if (url.split('url(').length > 2) continue;
      // skip fonts
      if (url.indexOf('format(') > 0) continue;
      // skip svg
      if (url.endsWith('.svg')) continue;

      url = fnComputeUrl(url);
      const result = await fnFetchImage(url);

      if (result.ok) {
        const newUrl = `url(${result.res})`;
        css = css.replace(urlMatch, newUrl);
      } else {
        fnConsoleLog('CssFactory->fetchUrl->ERROR !!!', result, css);
      }
    }
    return css;
  };

  static fetchCss(url: string): Promise<FetchResponse<string>> {
    // fnConsoleLog('CssFactory->fetchCss', url);
    return new Promise<FetchResponse<string>>((resolve, reject) => {
      TinyEventDispatcher.addListener<FetchResponse<string>>(BusMessageType.CONTENT_FETCH_CSS, (event, key, value) => {
        // fnConsoleLog('CssFactory->fetchCss->CONTENT_FETCH_CSS', value);
        if (value.url === url) {
          TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_CSS, key);
          resolve(value);
        }
      });
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
          reject(e);
        });
    });
  }
}
