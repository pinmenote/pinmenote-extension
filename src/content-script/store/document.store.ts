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

  private elements: PageTreeCache = {};

  static getInstance(): DocumentStore {
    if (!this.instance) this.instance = new DocumentStore();
    return this.instance;
  }

  get cache(): PageTreeCache {
    return this.elements;
  }

  remove(node: Node, target: Node) {
    if (node.nodeType === 8) return;
    if (IGNORED.includes(target.nodeName.toLowerCase()) || IGNORED.includes(node.nodeName.toLowerCase())) return;
    if (target === document.body) return;
    const el = node as HTMLElement;
    if (!el.innerHTML) return;
    const xpath = XpathFactory.newXPathString(target);
    fnConsoleLog('DocumentStore->remove', xpath, el);
    /* Experimental - TODO fix
    twitter - <div data-testid="cellInnerDiv" style="transform: translateY(5660px); position: absolute; width: 100%;">
    - fix sort by translateY position
    */
    if (!this.elements[xpath]) {
      const attrs = this.computeAttrs(el.tagName.toLowerCase(), Array.from(el.attributes));
      this.elements[xpath] = { xpath, html: el.innerHTML, attrs };
    } else if (this.elements[xpath].html.length < el.innerHTML.length) {
      const attrs = this.computeAttrs(el.tagName.toLowerCase(), Array.from(el.attributes));
      this.elements[xpath] = { xpath, html: el.innerHTML, attrs };
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
