import { XpathFactory } from '../../common/factory/xpath.factory';
import { fnConsoleLog } from '../../common/fn/fn-console';
import { fnXxhash } from '../../common/fn/fn-hash';

const IGNORED = ['head', 'html', 'title', 'script', 'style', 'header', 'svg'];

export class DocumentStore {
  private static instance: DocumentStore;

  private tree: { [key: string]: Set<number> } = {};

  static getInstance(): DocumentStore {
    if (!this.instance) this.instance = new DocumentStore();
    return this.instance;
  }

  add(node: Node, target: Node) {
    if (node.nodeType === 8) return;
    if (IGNORED.includes(target.nodeName.toLowerCase()) || IGNORED.includes(node.nodeName.toLowerCase())) return;
    //target.insertBefore(node, target.firstChild);
    //console.log('target', target.nodeName, 'removed', node.nodeName, 'type', node.nodeType);
    //this.findBodyPath(target);
    //console.log('node', node, target);
    const html = (node as HTMLElement).innerHTML;
    if (!html) return;
    const targetXpath = XpathFactory.newXPathString(target);
    const nodeHash = fnXxhash((node as HTMLElement).innerHTML);
    if (!this.tree[targetXpath]) {
      this.tree[targetXpath] = new Set<number>();
    }
    const s = this.tree[targetXpath];
    if (s.has(nodeHash)) {
      fnConsoleLog('HAS !!!! target', targetXpath, 'node', nodeHash);
    } else {
      s.add(nodeHash);
    }
  }
}
