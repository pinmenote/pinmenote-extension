/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ContentVideoTime, CssData, HtmlIntermediateData, HtmlParentStyles } from '@common/model/html.model';
import { environmentConfig } from '@common/environment';
import { fnConsoleLog } from './console.fn';
import { fnGetKey } from '@common/kv.utils';
import { fnXpath } from '@common/fn/xpath.fn';

type ComputeCssRule = CSSStyleRule & CSSRule & CSSGroupingRule & CSSConditionRule & CSSImportRule;

const computeSelectorRules = (cssRules: ComputeCssRule[], unique: Set<string>): string => {
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

export const fnComputeCssContent = (styles: string[]): CssData => {
  let css = '';
  const href: string[] = [];
  const unique = new Set(styles);
  const styleSheets = Array.from(document.styleSheets);
  styleSheets.forEach((s) => {
    if (s.href) {
      href.push(s.href);
    } else {
      css += computeSelectorRules(Array.from(s.cssRules) as ComputeCssRule[], unique);
    }
  });
  return {
    href,
    css
  };
};

export const fnComputeHtmlParentStyles = (ref: Element): HtmlParentStyles => {
  let parent = ref.parentElement;
  const cssStyles: string[] = [];
  while (parent && parent.tagName.toLowerCase() !== 'body') {
    const clazz = parent.getAttribute('class');
    if (clazz) {
      const a = clazz.split(' ').filter((e) => !!e);
      cssStyles.push(...a.map((e) => `.${e}`));
    }
    parent = parent.parentElement;
  }
  return {
    html: '',
    cssStyles
  };
};

export const fnComputeHtmlContent = (ref: Element): HtmlIntermediateData => {
  const tagName = ref.tagName.toLowerCase();
  const cssStyles: string[] = [tagName];
  let html = `<${tagName} `;
  const videoTime: ContentVideoTime[] = [];

  if (tagName === 'video') {
    // fnConsoleLog('VIDEO !!!', (el as HTMLVideoElement).currentTime);
    videoTime.push({
      xpath: fnXpath(ref as HTMLElement),
      currentTime: (ref as HTMLVideoElement).currentTime,
      displayTime: environmentConfig.settings.videoDisplayTime
    });
  }

  const attributes: Attr[] = Array.from(ref.attributes);
  for (const attr of attributes) {
    if (attr.name === 'class') {
      // CLASS CSS SELECTORS
      const a = attr.value.split(' ').filter((e) => !!e);
      cssStyles.push(...a.map((e) => `.${e}`));
      html += `${attr.name}="${attr.value}" `;
    } else if (attr.name === 'href') {
      // HREF
      if (attr.value.startsWith('/')) {
        html += `href="${window.location.origin}${attr.value}" `;
      } else if (!attr.value.startsWith('http')) {
        html += `src="${window.location.origin}/${attr.value}" `;
      } else {
        html += `href="${attr.value}" `;
      }
      html += `target="_blank" `;
    } else if (attr.name === 'target') {
      // Skip - we handle it inside href
    } else if (attr.name === 'src') {
      if (attr.value.startsWith('/')) {
        html += `src="${window.location.origin}${attr.value}" `;
      } else if (!attr.value.startsWith('http')) {
        html += `src="${window.location.origin}/${attr.value}" `;
      } else {
        html += `src="${attr.value}" `;
      }
    } else {
      html += `${attr.name}="${attr.value}" `;
    }
  }
  html = html.substring(0, html.length - 1) + '>';

  const nodes = Array.from(ref.childNodes);

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nre = new RegExp(String.fromCharCode(160), 'g');
      html += node.textContent ? node.textContent.replace(nre, '&nbsp;') : '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const computed = fnComputeHtmlContent(node as Element);
      html += computed.html;
      cssStyles.push(...computed.cssStyles);
      videoTime.push(...computed.videoTime);
    } else if (node.nodeType === Node.COMMENT_NODE) {
      fnConsoleLog('fnComputeHtmlContent->skipping->COMMENT_NODE', node);
    } else {
      fnConsoleLog('PROBLEM fnComputeHtmlContent !!!', node.nodeType);
    }
  }
  html += `</${tagName}>`;

  return {
    cssStyles,
    html,
    videoTime
  };
};
