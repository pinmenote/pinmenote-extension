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
import { ObjRectangleDto } from '../model/obj/obj-utils.dto';

interface XPathTag {
  index: number;
  tagName: string;
}

interface XPathNode {
  index: number;
  node: Node;
}

const XPATH_INDEX_REGEX = new RegExp('(\\[)(.*?])', 'g');

export class XpathFactory {
  static newXPathString(element: Node): string {
    let child = element;
    let parent = child.parentElement;
    let path: XPathTag[] = [];
    while (parent) {
      const index = this.findNodeNameIndex(Array.from(parent.childNodes), child);
      path.push({
        index,
        tagName: child.nodeName.toLowerCase()
      });
      child = parent;
      parent = parent.parentElement;
    }
    path = path.reverse();
    path.splice(0, 1);
    return `/html/body/${path.map((p) => `${p.tagName}[${p.index}]`).join('/')}`;
  }

  static newXPathNode(element: Node) {
    let child = element;
    let parent = child.parentElement;
    const path: XPathNode[] = [];
    while (parent) {
      const index = this.findNodeNameIndex(Array.from(parent.childNodes), child);
      path.push({
        index,
        node: child
      });
      child = parent;
      parent = parent.parentElement;
    }
    return path.reverse();
  }

  private static findNodeNameIndex(nodes: ChildNode[], child: Node): number {
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

  static evaluateTree(path: string, tree: any): object | undefined {
    const a = path.split('/');
    let subtree = tree;
    a.shift();
    for (const p of a) {
      const m = p.match(XPATH_INDEX_REGEX);
      let tag = p.toLowerCase();
      let index = 0;
      if (m) {
        tag = p.replaceAll(XPATH_INDEX_REGEX, '').toLowerCase();
        index = parseInt(m[0].substring(1, m[0].length - 1)) - 1;
      }
      let found = false;
      for (const child of subtree.childNodes) {
        if (child.tagName === tag) {
          index === 0 ? (subtree = child) : index--;
          found = true;
          break;
        }
      }
      if (!found) return undefined;
    }
    return subtree;
  }

  static newXPathResult(document: Document, path: string): XPathResult {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
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
