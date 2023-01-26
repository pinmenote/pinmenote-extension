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
import { ObjRectangleDto } from '../model/obj-utils.model';

interface XPathElement {
  position: number;
  tagName: string;
}

export class XpathFactory {
  static newXPathString(element: HTMLElement): string {
    let child = element;
    let parent = child.parentElement;
    let path: XPathElement[] = [];
    while (parent) {
      const position = this.findNodeNameIndex(Array.from(parent.childNodes), child);
      path.push({
        position,
        tagName: child.tagName
      });
      child = parent;
      parent = parent.parentElement;
    }
    path = path.reverse();
    path.splice(0, 1);
    return `/html/body/${path.map((p) => `${p.tagName}[${p.position}]`).join('/')}`;
  }

  private static findNodeNameIndex(nodes: ChildNode[], child: HTMLElement): number {
    let index = 1;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.nodeName === child.nodeName && child !== node) {
        index++;
      } else if (child === node) {
        break;
      }
    }
    return index;
  }

  static newXPathResult(xpath: string): XPathResult {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
  }

  static computeRect = (ref: HTMLElement): ObjRectangleDto => {
    const rect = ref.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  };
}
