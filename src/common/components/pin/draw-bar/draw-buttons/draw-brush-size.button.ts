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
import { HtmlInnerFactory } from '../../../../factory/html-inner.factory';
import { HtmlComponent, HtmlComponentFocusable } from '../../model/pin-view.model';
import { DrawBrushSize } from './draw-brush-size';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawBrushSizeButton implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el: HTMLDivElement;

  private visible = false;

  private sizeInput: DrawBrushSize;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.sizeInput = new DrawBrushSize(model);
  }

  render(): HTMLElement {
    const fill = this.visible ? '#ff0000' : '#000000';
    HtmlInnerFactory.html(
      HtmlInnerFactory.html(
        this.el,
        'svg',
        {
          height: '24',
          viewBox: '0 0 24 24',
          width: '24'
        },
        HtmlInnerFactory.SVG_NS
      ),
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '4',
        fill
      },
      HtmlInnerFactory.SVG_NS
    );
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    this.model.top.appendChild(this.sizeInput.render());

    return this.el;
  }

  setSize(value: number) {
    this.sizeInput.setSize(value);
  }

  focusin() {
    if (this.visible) this.sizeInput.show();
  }

  focusout() {
    this.sizeInput.hide();
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
    this.sizeInput.cleanup();
  }

  private handleClick = () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.sizeInput.show();
      (this.el.firstChild?.childNodes[1] as SVGCircleElement).setAttribute('fill', '#ff0000');
    } else {
      this.sizeInput.hide();
      (this.el.firstChild?.childNodes[1] as SVGCircleElement).setAttribute('fill', '#000000');
    }
  };
}
