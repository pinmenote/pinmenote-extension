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
import { FetchCssRequest, FetchCssResponse } from '../../common/model/obj-request.model';
import { PinCssDataDto, PinCssHref } from '../../common/model/obj-pin.model';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnGetKey } from '../../common/fn/kv.utils';

type ComputeCssRule = CSSStyleRule & CSSRule & CSSGroupingRule & CSSConditionRule & CSSImportRule;

export class CssFactory {
  static computeCssContent = async (styles: string[]): Promise<PinCssDataDto> => {
    let css = '';
    const href: PinCssHref[] = [];
    const unique = new Set(styles);
    const styleSheets = Array.from(document.styleSheets);
    for (let i = 0; i < styleSheets.length; i++) {
      const s = styleSheets[i];
      if (s.href) {
        const cssFetchData = await this.fetchCss(s.href);
        href.push({
          href: s.href,
          data: cssFetchData.error ? undefined : cssFetchData.data
        });
      } else {
        css += this.computeSelectorRules(Array.from(s.cssRules) as ComputeCssRule[], unique);
      }
    }
    return {
      href,
      css
    };
  };

  private static computeSelectorRules = (cssRules: ComputeCssRule[], unique: Set<string>): string => {
    let output = '';
    cssRules.forEach((r: ComputeCssRule) => {
      if (fnGetKey(r, 'selectorText')) {
        unique.forEach((u) => {
          if (u.startsWith('.')) {
            if (
              r.selectorText.startsWith(`${u}:`) ||
              r.selectorText.startsWith(`${u} `) ||
              r.selectorText.startsWith(`${u}[`) ||
              r.selectorText.startsWith(`${u}.`) ||
              r.selectorText === u
            ) {
              output += `${r.cssText}
`;
            }
          } else {
            const selectors: string[] = r.selectorText.split(',');
            selectors.forEach((s) => {
              if (u === s || `* ${u}` === s || s.startsWith(`${u}[`) || s.startsWith(`${u}.`)) {
                output += `${r.cssText}
`;
              }
            });
          }
        });
      } else if (r.media) {
        // TODO - optimize that ( ok for now ) - look at old source from repo
        output += `@media ${r.conditionText} {
        ${r.cssText}
      }
      `;
      } else {
        // TODO parse other rules ex CSSKeyFrameRules
      }
    });
    return output;
  };

  private static fetchCss(url: string): Promise<FetchCssResponse> {
    fnConsoleLog('CssFactory->fetchCss', url);
    return new Promise<FetchCssResponse>((resolve, reject) => {
      TinyEventDispatcher.addListener<FetchCssResponse>(BusMessageType.CONTENT_FETCH_CSS, (event, key, value) => {
        if (value.url === url) {
          TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_CSS, key);
          fnConsoleLog(`GOT IT ${value.url} ${value.data}`);
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
