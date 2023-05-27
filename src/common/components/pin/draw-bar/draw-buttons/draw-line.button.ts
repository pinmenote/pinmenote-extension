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

export class DrawLineButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private selected = false;

  constructor(private drawBar: DrawBarComponent, model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    const stroke = this.selected ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg height="24" viewBox="0 0 24 24" width="24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
<line x1="4" x2="18" y1="18" y2="4" opacity="1" stroke="${stroke}" stroke-linecap="round" stroke-linejoin="miter" stroke-width="2"/>

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
      this.drawBar.setTool(DrawToolDto.Line);
    }
  };
}
