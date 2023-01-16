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
import { DrawColorPicker } from './draw-color-picker';
import { PinComponent } from '../../pin.component';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class DrawColorPickerComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el = document.createElement('div');

  private picker: DrawColorPicker;

  private visible = false;

  constructor(private rect: PinRectangle, private parent: PinComponent) {
    this.picker = new DrawColorPicker(rect, this);
  }

  render(): HTMLElement {
    const stroke = this.visible ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
        <g>
            <rect fill="#00ff00" opacity="1" stroke="${stroke}" stroke-width="2" height="18" width="18"/>
        </g>
    </svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    this.parent.top.appendChild(this.picker.render());
    this.picker.setColor('#ff0000');
    this.updateColor(this.color());
    return this.el;
  }

  color(): string {
    return this.picker.hexColor();
  }

  updateColor(color: string) {
    (this.el.firstChild?.childNodes[1].childNodes[1] as SVGRectElement).setAttribute('fill', color);
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  focusin() {
    if (this.visible) this.picker.show();
  }

  focusout() {
    this.picker.hide();
  }

  private handleClick = () => {
    this.visible = !this.visible;
    if (this.visible) {
      this.picker.show();
      (this.el.firstChild?.childNodes[1].childNodes[1] as SVGRectElement).setAttribute('stroke', '#ff0000');
    } else {
      this.picker.hide();
      (this.el.firstChild?.childNodes[1].childNodes[1] as SVGRectElement).setAttribute('stroke', '#000000');
    }
  };
}
