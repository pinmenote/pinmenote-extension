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
import { HtmlComponent } from '../../model/pin-view.model';
import MathMLToLaTeX from '../../../../../vendor/mathml-to-latex/src';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';
import { fnConsoleLog } from '../../../../fn/fn-console';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class ActionCopyButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;
  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24">
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
    const clipboardCopy = this.model.ref.getElementsByTagName('clipboard-copy');
    if (clipboardCopy.length > 0) {
      text = clipboardCopy[0].getAttribute('value') || '';
    }
    if (!text && this.model.ref.tagName === 'IMG') {
      text = this.model.ref.getAttribute('alt') || '';
    }
    // Support for math-jax copy as tex inside iframe
    // Sample url https://github.com/mholtrop/QMPython/blob/master/Solving_the_Schrodinger_Equation_Numerically.ipynb
    if (this.model.ref.tagName.startsWith('MJX-')) {
      // find mathjax and then find math tag inside it
      const mathJaxContainer = this.findMathJaxParent(this.model.ref);
      const mathTag = mathJaxContainer.getElementsByTagName('math')[0];
      if (mathTag?.parentElement) {
        text = MathMLToLaTeX.convert(mathTag.parentElement.innerHTML);
      }
    }
    if (!text) {
      text = this.model.ref.innerText.replaceAll('\u00a0', ' ');
    }
    // window.navigator.clipboard not working in iframe :/
    const copyFn = (event: ClipboardEvent) => {
      fnConsoleLog('COPY FN', event.clipboardData, 'text :', text, 'ref', this.model.ref);
      event.preventDefault();
      event.clipboardData?.setData('text/plain', text);
    };
    document.addEventListener('copy', copyFn);
    document.execCommand('copy');
    document.removeEventListener('copy', copyFn);
    // await window.navigator.clipboard.writeText(text);
  };
}