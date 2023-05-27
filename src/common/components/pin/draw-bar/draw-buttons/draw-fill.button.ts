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
import { DrawBarComponent } from '../draw-bar.component';
import { DrawToolDto } from '../../../../model/obj/obj-draw.dto';
import { HtmlComponent } from '../../model/pin-view.model';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawFillButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private selected = false;

  constructor(private drawBar: DrawBarComponent, model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    const fill = this.selected ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <g>
          <rect fill="none" height="24" width="24"/>
        </g>
        <g fill="${fill}">
          <path d="M16.56,8.94L7.62,0L6.21,1.41l2.38,2.38L3.44,8.94c-0.59,0.59-0.59,1.54,0,2.12l5.5,5.5C9.23,16.85,9.62,17,10,17 s0.77-0.15,1.06-0.44l5.5-5.5C17.15,10.48,17.15,9.53,16.56,8.94z M5.21,10L10,5.21L14.79,10H5.21z M19,11.5c0,0-2,2.17-2,3.5 c0,1.1,0.9,2,2,2s2-0.9,2-2C21,13.67,19,11.5,19,11.5z M1,20h20v2H1V20z"/>
        </g>
</svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  select() {
    this.selected = false;
    (this.el.firstChild?.childNodes[3] as SVGPathElement).setAttribute('fill', '#ff0000');
  }

  unselect() {
    this.selected = false;
    (this.el.firstChild?.childNodes[3] as SVGPathElement).setAttribute('fill', '#000000');
  }

  private handleClick = () => {
    if (this.selected) {
      this.unselect();
    } else {
      this.select();
      this.drawBar.setTool(DrawToolDto.Fill);
    }
  };
}
