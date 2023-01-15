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
import { CssData } from '../../common/model/html.model';
import { fnGetKey } from '../../common/fn/kv.utils';

type ComputeCssRule = CSSStyleRule & CSSRule & CSSGroupingRule & CSSConditionRule & CSSImportRule;

export class CssFactory {
  static computeCssContent = (styles: string[]): CssData => {
    let css = '';
    const href: string[] = [];
    const unique = new Set(styles);
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach((s) => {
      if (s.href) {
        href.push(s.href);
      } else {
        css += this.computeSelectorRules(Array.from(s.cssRules) as ComputeCssRule[], unique);
      }
    });
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
}
