export class HtmlInnerFactory {
  static readonly SVG_NS = 'http://www.w3.org/2000/svg';
  static html(parent: Element, tag: string, attrs?: { [key: string]: string }, ns?: string, txt?: string): Element {
    const el = ns ? document.createElementNS(ns, tag) : document.createElement(tag);

    parent.append(el);
    if (txt) (el as HTMLElement).innerText = txt;
    if (!attrs) return el;

    for (const key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
    return el;
  }
}
