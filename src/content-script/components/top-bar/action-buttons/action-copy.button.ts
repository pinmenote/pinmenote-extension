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
import { HtmlComponent } from '../../../../common/model/html.model';
import MathMLToLaTeX from 'mathml-to-latex';
import { PinComponent } from '../../pin.component';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnConsoleLog } from '../../../../common/fn/console.fn';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class ActionCopyButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');
  constructor(private parent: PinComponent) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000" height="24" viewBox="0 0 24 24" width="24">
  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
</svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  cleanup() {
    this.el.removeEventListener('click', this.handleClick);
  }

  private findMathJaxParent = (ref: HTMLElement): HTMLElement => {
    if (ref.parentElement && ref.parentElement.tagName.startsWith('MJX-')) {
      return this.findMathJaxParent(ref.parentElement);
    }
    return ref;
  };

  private handleClick = () => {
    let text = '';
    const clipboardCopy = this.parent.ref.getElementsByTagName('clipboard-copy');
    if (clipboardCopy.length > 0) {
      text = clipboardCopy[0].getAttribute('value') || '';
    }
    if (!text && this.parent.ref.tagName === 'IMG') {
      text = this.parent.ref.getAttribute('alt') || '';
    }
    // Support for math-jax copy as tex inside iframe
    // Sample url https://github.com/mholtrop/QMPython/blob/master/Solving_the_Schrodinger_Equation_Numerically.ipynb
    if (this.parent.ref.tagName.startsWith('MJX-')) {
      // find mathjax and then find math tag inside it
      const mathJaxContainer = this.findMathJaxParent(this.parent.ref);
      const mathTag = mathJaxContainer.getElementsByTagName('math')[0];
      if (mathTag?.parentElement) {
        text = MathMLToLaTeX.convert(mathTag.parentElement.innerHTML);
      }
    }
    if (!text) {
      text = this.parent.ref.innerText.replaceAll('\u00a0', ' ');
    }
    // window.navigator.clipboard not working in iframe :/
    const copyFn = (event: ClipboardEvent) => {
      fnConsoleLog('COPY FN', event.clipboardData, 'text :', text, 'ref', this.parent.ref);
      event.preventDefault();
      event.clipboardData?.setData('text/plain', text);
    };
    document.addEventListener('copy', copyFn);
    document.execCommand('copy');
    document.removeEventListener('copy', copyFn);
    // await window.navigator.clipboard.writeText(text);
  };
}
