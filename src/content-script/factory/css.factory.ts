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
import { FetchCssRequest, FetchCssResponse } from '../../common/model/obj-request.model';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';

type ComputeCssRule = CSSStyleRule & CSSRule & CSSGroupingRule & CSSConditionRule & CSSImportRule;

export class CssFactory {
  static computeCssContent = async (): Promise<CssDataDto> => {
    // TODO fetch missing data from css tags key: url(relative/path)
    let css = '';
    const href: CssHrefDto[] = [];
    const styleSheets = Array.from(document.styleSheets);
    for (let i = 0; i < styleSheets.length; i++) {
      const s = styleSheets[i];
      if (s.href) {
        const cssFetchData = await this.fetchCss(s.href);
        href.push({
          href: s.href,
          media: s.media.mediaText,
          data: cssFetchData.error ? undefined : cssFetchData.data
        });
        // fnConsoleLog('CssFactory->computeCssContent', s.href, s);
      } else {
        css += await this.computeSelectorRules(Array.from(s.cssRules) as ComputeCssRule[], href);
      }
    }
    // fnConsoleLog('CssFactory->computeCssContent', href);
    return {
      href,
      css
    };
  };

  private static computeSelectorRules = async (cssRules: ComputeCssRule[], hrefList: CssHrefDto[]): Promise<string> => {
    let output = '';
    for (const r of cssRules) {
      if (r.href) {
        let href = r.href;
        if (!href.startsWith('http')) href = location.protocol + href;
        const cssFetchData = await this.fetchCss(href);
        hrefList.push({
          href,
          media: r.parentStyleSheet ? r.parentStyleSheet.media.mediaText : r.styleSheet.media.mediaText,
          data: cssFetchData.error ? undefined : cssFetchData.data
        });
        // fnConsoleLog('CssFactory->computeSelectorRules->href', r);
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

  private static fetchCss(url: string): Promise<FetchCssResponse> {
    // fnConsoleLog('CssFactory->fetchCss', url);
    return new Promise<FetchCssResponse>((resolve, reject) => {
      TinyEventDispatcher.addListener<FetchCssResponse>(BusMessageType.CONTENT_FETCH_CSS, (event, key, value) => {
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
