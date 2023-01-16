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
import { HtmlComponent, HtmlComponentFocusable } from '../../../../common/model/html.model';
import { DrawBrushSize } from './draw-brush-size';
import { PinComponent } from '../../pin.component';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawBrushSizeButton implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el = document.createElement('div');

  private visible = false;

  private sizeInput: DrawBrushSize;

  constructor(private parent: PinComponent) {
    this.sizeInput = new DrawBrushSize();
  }

  render(): HTMLElement {
    const fill = this.visible ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <circle cx="12" cy="12" r="4" fill="${fill}" />
        </svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    this.parent.top.appendChild(this.sizeInput.render());

    return this.el;
  }

  setSize(value: number) {
    this.sizeInput.setSize(value);
  }

  value(): number {
    return this.sizeInput.value();
  }

  focusin() {
    if (this.visible) this.sizeInput.show();
  }

  focusout() {
    this.sizeInput.hide();
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
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
