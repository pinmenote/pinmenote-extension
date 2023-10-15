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
import { PageTreeCache } from '@pinmenote/page-compute';
import { XpathFactory } from '@pinmenote/page-compute';
import { fnConsoleLog } from '../../common/fn/fn-console';

const IGNORED = ['head', 'html', 'title', 'script', 'style', 'header', 'svg'];

export class DocumentStore {
  private static instance: DocumentStore;

  private elements: PageTreeCache = { tree: {}, origin: '' };

  static getInstance(): DocumentStore {
    if (!this.instance) this.instance = new DocumentStore();
    return this.instance;
  }

  get cache(): PageTreeCache {
    this.elements.origin = location.origin;
    if (location.origin.endsWith('twitter.com') || location.origin.endsWith('x.com')) {
      this.elements.target = Object.entries(this.twitterTagCounter).sort((a, b) => {
        if (a[1] > b[1]) return 1;
        if (a[1] < b[1]) return -1;
        return 0;
      })[0][0];
      fnConsoleLog('DocumentStore->cache', this.elements);
    }
    return this.elements;
  }

  remove(node: Node, target: Node) {
    if (node.nodeType === 8) return;
    if (IGNORED.includes(target.nodeName.toLowerCase()) || IGNORED.includes(node.nodeName.toLowerCase())) return;
    if (target === document.body) return;
    const el = node as HTMLElement;
    if (!el.innerHTML) return;
    const xpath = XpathFactory.newXPathString(target);
    // Experimental
    if (location.origin.endsWith('wykop.pl')) this.addToWykopCache(xpath, el, target as HTMLElement);
    if (location.origin.endsWith('facebook.com')) this.addToFacebookCache(xpath, el, target as HTMLElement);
    if (location.origin.endsWith('twitter.com') || location.origin.endsWith('x.com'))
      this.addToTwitterCache(xpath, el, target as HTMLElement);
  }

  private twitterTagCounter: { [key: string]: number } = {};
  private addToTwitterCache(xpath: string, el: HTMLElement, target: HTMLElement) {
    /*
    twitter - <div data-testid="cellInnerDiv" style="transform: translateY(5660px); position: absolute; width: 100%;">
    - fix sort by translateY position
    */
    // fnConsoleLog('DocumentStore->addToTwitterCache', xpath, 'el', el, 'target', target);
    if (el.tagName.toLowerCase() === 'div' && el.style.transform.startsWith('translateY')) {
      let offset = el.style.transform.substring(11).replaceAll(')', '');
      if (offset.endsWith('px')) offset = offset.substring(0, offset.length - 2);
      try {
        const txpath = XpathFactory.newXPathString(target);
        if (!this.twitterTagCounter[txpath]) this.twitterTagCounter[txpath] = 0;
        this.twitterTagCounter[txpath] += 1;
        fnConsoleLog('DocumentStore->addToTwitterCache', el, 'offset', offset, 'xpath');
        const attrs = this.computeAttrs(el.tagName.toLowerCase(), Array.from(el.attributes));
        this.elements.tree[offset] = {
          tagName: el.tagName.toLowerCase(),
          xpath: parseInt(offset).toString(),
          html: el.innerHTML,
          attrs,
          target: txpath
        };
      } catch (e) {
        fnConsoleLog('DocumentStore->addToTwitterCache->error', e);
      }
    }
  }

  private addToFacebookCache(xpath: string, el: HTMLElement, target: HTMLElement) {
    /*
    facebook - <div class="x1lliihq"></div>
    - probably need to find container that have most divs that are repeating
     */
    if (target.className === 'x1lliihq') {
      fnConsoleLog('DocumentStore->addToFacebookCache', xpath, 'el', el, 'target', target);
      /*const attrs = this.computeAttrs(el.tagName.toLowerCase(), Array.from(el.attributes));
      this.elements[xpath] = { xpath, html: el.innerHTML, attrs };*/
    }
  }

  private addToWykopCache(xpath: string, el: HTMLElement, target: HTMLElement) {
    if (!this.elements.tree[xpath]) {
      fnConsoleLog('DocumentStore->addToWykopCache', xpath, 'el', el, 'target', target);
      const attrs = this.computeAttrs(el.tagName.toLowerCase(), Array.from(el.attributes));
      this.elements.tree[xpath] = { tagName: el.tagName.toLowerCase(), xpath, html: el.innerHTML, attrs };
    } else if (this.elements.tree[xpath].html.length < el.innerHTML.length) {
      fnConsoleLog('DocumentStore->addToWykopCache', xpath, 'el', el, 'target', target);
      const attrs = this.computeAttrs(el.tagName.toLowerCase(), Array.from(el.attributes));
      this.elements.tree[xpath] = { tagName: el.tagName.toLowerCase(), xpath, html: el.innerHTML, attrs };
    }
  }

  private computeAttrs = (tagName: string, attributes: Attr[]): string => {
    let html = '';
    for (const attr of attributes) {
      let attrValue = attr.value;
      attrValue = attrValue.replaceAll('"', '&quot;');
      if ((tagName === 'input' || tagName === 'textarea') && attr.name === 'value') continue;
      if (attrValue) {
        html += `${attr.name}="${attrValue}" `;
      } else {
        html += `${attr.name} `;
      }
    }
    return html.trimEnd();
  };
}
