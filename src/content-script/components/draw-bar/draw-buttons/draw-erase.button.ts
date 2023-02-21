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
import { DrawToolDto } from '../../../../common/model/obj/obj-draw.dto';
import { HtmlComponent } from '../../../../common/model/html.model';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawEraseButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private selected = false;

  constructor(private drawBar: DrawBarComponent) {}

  render(): HTMLElement {
    const stroke = this.selected ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg height="24" viewBox="0 0 24 24" width="24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
<g stroke="${stroke}">
<path d="M3.23657 20.2399L21.6576 20.1008" opacity="1" stroke-linecap="round" stroke-linejoin="miter" stroke-width="1.5"/>
<path d="M9.67757 7.86098L15.6261 13.7952" opacity="1" stroke-linecap="round" stroke-linejoin="miter" stroke-width="1.5"/>
<path d="M3.27042 13.6276L14.8388 2.02445" opacity="1" stroke-linecap="round" stroke-linejoin="miter" stroke-width="1.5"/>
<path d="M14.897 1.98029L21.3661 8.10477" opacity="1" stroke-linecap="round" stroke-linejoin="miter" stroke-width="1.5"/>
<path d="M9.85537 19.938L3.36094 13.6994" opacity="1" stroke-linecap="round" stroke-linejoin="miter" stroke-width="1.5"/>
<path d="M9.84363 19.7414L21.412 8.1383" opacity="1" stroke-linecap="round" stroke-linejoin="miter" stroke-width="1.5"/>
</g>

</svg>
`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }
  select() {
    this.selected = false;
    (this.el.firstChild?.childNodes[1] as SVGPathElement).setAttribute('stroke', '#ff0000');
  }

  unselect() {
    this.selected = false;
    (this.el.firstChild?.childNodes[1] as SVGPathElement).setAttribute('stroke', '#000000');
  }

  private handleClick = () => {
    if (this.selected) {
      this.unselect();
    } else {
      this.select();
      this.drawBar.setTool(DrawToolDto.Erase);
    }
  };
}
