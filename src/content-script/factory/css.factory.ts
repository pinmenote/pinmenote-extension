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

type ComputeCssRule = CSSStyleRule & CSSRule & CSSGroupingRule & CSSConditionRule & CSSImportRule & CSSSupportsRule;

export const CSS_URL_REG = new RegExp('url\\(.*?\\)', 'ig');
export const CSS_IMPORT_REG = new RegExp(
  '(?:@import)(?:\\s)(?:url)?(?:(?:(?:\\()(["\'])?(?:[^"\')]+)\\1(?:\\))|(["\'])(?:.+)\\2)(?:[A-Z\\s])*)+(?:;)',
  'gi'
);

export class CssFactory {
  private static readonly urlImportStripRegex = new RegExp('[()\'";]', 'g');

  static computeCssContent = async (skipUrlCache?: Set<string>): Promise<CssStyleListDto> => {
    const css: CssStyleDto[] = [];
    const styleSheets = Array.from(document.styleSheets);
    fnConsoleLog('CssFactory->computeCssContent', styleSheets.length);

    for (let i = 0; i < styleSheets.length; i++) {
      const s = styleSheets[i];
      if (s.href) {
        // skip
        if (skipUrlCache?.has(s.href)) continue;

        const url = new URL(s.href);
        const cssFetchData = await this.fetchCss(url.href);

        if (cssFetchData.ok) {
          const imports = await this.fetchImports(cssFetchData.res, url.href, skipUrlCache);

          let data = cssFetchData.res.replace(CSS_IMPORT_REG, '').trim();
          data = await this.fetchUrls(data, url.href, skipUrlCache);
          css.push(...imports);

          css.push({
            href: s.href,
            media: s.media.mediaText,
            data
          });
        } else {
          skipUrlCache?.add(s.href);
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

  private static computeSelectorRules = async (
    stylesheet: CSSStyleSheet,
    skipUrlCache?: Set<string>
  ): Promise<CssStyleDto[]> => {
    const css: CssStyleDto[] = [];
    let out = '';
    const cssRules = Array.from(stylesheet.cssRules) as ComputeCssRule[];
    for (const r of cssRules) {
      if (r.media) {
        // TODO - optimize that ( ok for now ) - look at old source from repo
        let data = r.cssText;
        const imports = await this.fetchImports(data, undefined, skipUrlCache);
        data = data.replaceAll(CSS_IMPORT_REG, '').trim();
        css.push(...imports);
        out += data + '\n';
      } else if (r.selectorText) {
        let data = r.cssText;
        const imports = await this.fetchImports(data, undefined, skipUrlCache);
        data = data.replaceAll(CSS_IMPORT_REG, '').trim();
        css.push(...imports);
        out += data + '\n';
      } else if (r instanceof CSSSupportsRule) {
        out += r.cssText + '\n';
      } else {
        // TODO parse other rules ex CSSKeyFrameRules
        fnConsoleLog('CssFactory->computeSelectorRules->SKIP', r);
      }
    }
    css.push({
      data: out,
      media: stylesheet.media.mediaText
    });
    return css;
  };

  static fetchImports = async (css: string, rel?: string, skipUrlCache?: Set<string>): Promise<CssStyleDto[]> => {
    const importList = css.match(CSS_IMPORT_REG);
    if (!importList) return [];

    const out = [];

    for (const importUrl of importList) {
      if (importUrl.startsWith('http')) continue;
      let url = importUrl.split(' ')[1];
      let baseUrl = undefined;
      if (url.startsWith('url')) {
        const urlMatch = url.match(CSS_URL_REG);
        if (!urlMatch) continue;
        url = urlMatch[0].substring(3, urlMatch[0].length - 1);
      }
      url = url.replaceAll(this.urlImportStripRegex, '');

      if (rel && !url.startsWith('http')) {
        const a = rel.split('/');
        baseUrl = a.slice(0, a.length - 1).join('/');
        if (url.startsWith('/')) {
          url = new URL(baseUrl).origin + url;
        } else {
          url = new URL(baseUrl + '/' + url).href;
        }
        fnConsoleLog('CssFactory->fetchImports->REL !!!', rel, url);
      } else {
        url = fnComputeUrl(url);
      }

      // skip
      if (skipUrlCache?.has(url)) return out;

      const result = await this.fetchCss(url);

      if (result.ok) {
        // !important recurrence of getting imports inside imports here
        let data = result.res;
        const imports = await this.fetchImports(result.res);
        data = data.replaceAll(CSS_IMPORT_REG, '').trim();
        out.push(...imports);
        // Now fetch urls to save offline
        const urlData = await this.fetchUrls(data, baseUrl);
        out.push({
          href: result.url,
          media: '',
          data: urlData
        });
      } else {
        skipUrlCache?.add(url);
        fnConsoleLog('CssFactory->fetchImports->ERROR !!!', importUrl, url);
      }
    }
    return out;
  };

  static fetchUrls = async (css: string, baseurl?: string, skipUrlCache?: Set<string>): Promise<string> => {
    const urlList = css.match(CSS_URL_REG);
    if (!urlList) return css;
    if (baseurl?.endsWith('.css')) {
      const a = baseurl?.split('/');
      a.pop();
      baseurl = a.join('/');
    }

    for (const urlMatch of urlList) {
      let url = urlMatch.substring(4, urlMatch.length - 1);
      if (url.startsWith('"') || url.startsWith("'")) url = url.substring(1, url.length - 1);
      if (url.endsWith(';')) url = url.substring(0, url.length - 1);
      // TODO not working svg+xml - but we skip svg anyway so ignore now
      if (url.startsWith('data:image/svg+xml;charset=utf8')) {
        css = css.replace(urlMatch, 'url()');
        continue;
      }
      // skip data elements
      if (url.startsWith('data:')) continue;
      // skip url with #
      if (url.startsWith('#')) continue;
      // skip multiple urls
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
        if (url.startsWith('/')) {
          url = new URL(baseurl).origin + url;
        } else {
          url = new URL(baseurl + '/' + url).href;
        }
      } else {
        url = fnComputeUrl(url);
      }

      if (skipUrlCache?.has(url)) continue;

      const result = await fnFetchImage(url);

      if (result.ok) {
        const newUrl = `url(${result.res})`;
        css = css.replace(urlMatch, newUrl);
      } else {
        fnConsoleLog('CssFactory->fetchUrl->ERROR !!!', result, baseurl);
        skipUrlCache?.add(url);
        break;
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
