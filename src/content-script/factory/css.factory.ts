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
import { CssDataDto, CssHrefDto } from '../../common/model/obj/obj-pin.dto';
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
  static computeCssContent = async (): Promise<CssDataDto> => {
    let css = '';
    const href: CssHrefDto[] = [];
    const styleSheets = Array.from(document.styleSheets);
    fnConsoleLog('CssFactory->computeCssContent');

    for (let i = 0; i < styleSheets.length; i++) {
      const s = styleSheets[i];
      if (s.href) {
        const cssFetchData = await this.fetchCss(s.href);

        if (cssFetchData.ok) {
          const imports = await this.fetchImports(cssFetchData.res);
          href.push(...imports);

          let data = cssFetchData.res.replaceAll(IMPORT_REG, '').trim();
          data = await this.fetchUrls(data);

          href.push({
            href: s.href,
            media: s.media.mediaText,
            data
          });
        } else {
          href.push({
            href: s.href,
            media: s.media.mediaText,
            data: undefined
          });
        }
      } else {
        css += await this.computeSelectorRules(Array.from(s.cssRules) as ComputeCssRule[], href);
      }
    }
    const imports = await this.fetchImports(css);
    href.push(...imports);

    css = css.replaceAll(IMPORT_REG, '').trim();
    css = await this.fetchUrls(css);
    return {
      href,
      css
    };
  };

  private static computeSelectorRules = async (cssRules: ComputeCssRule[], hrefList: CssHrefDto[]): Promise<string> => {
    let output = '';
    for (const r of cssRules) {
      if (r.href) {
        const href = fnComputeUrl(r.href);
        const cssFetchData = await this.fetchCss(href);
        hrefList.push({
          href,
          media: r.parentStyleSheet ? r.parentStyleSheet.media.mediaText : r.styleSheet.media.mediaText,
          data: cssFetchData.ok ? cssFetchData.res : undefined
        });
      } else if (r.media) {
        // TODO - optimize that ( ok for now ) - look at old source from repo
        output += `@media ${r.conditionText} {
  ${r.cssText}
}
`;
      } else if (r.selectorText) {
        output += `${r.cssText}
`;
      } else {
        // TODO parse other rules ex CSSKeyFrameRules
        // fnConsoleLog('CssFactory->computeSelectorRules->SKIP', r);
      }
    }
    return output;
  };

  private static fetchImports = async (css: string): Promise<CssHrefDto[]> => {
    const importList = css.match(IMPORT_REG);
    if (!importList) return [];

    const out = [];

    for (const importUrl of importList) {
      if (importUrl.startsWith('http')) continue;
      let url = importUrl.split(' ')[1];

      url = url.endsWith(';') ? url.substring(1, url.length - 2) : url.substring(1, url.length - 1);

      const urlMatch = url.match(CSS_URL_REG);
      if (!urlMatch) continue;
      url = urlMatch[0].substring(5, urlMatch[0].length - 2);

      url = fnComputeUrl(url);
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
