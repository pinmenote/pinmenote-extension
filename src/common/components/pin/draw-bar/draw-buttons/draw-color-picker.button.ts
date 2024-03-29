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
import { HtmlComponent, HtmlComponentFocusable } from '../../model/pin-view.model';
import { DrawColorPicker } from './draw-color-picker';
import { HtmlInnerFactory } from '../../../../factory/html-inner.factory';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawColorPickerButton implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el: HTMLDivElement;

  private picker: DrawColorPicker;

  private visible = false;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.picker = new DrawColorPicker(model, this);
  }

  render(): HTMLElement {
    const stroke = this.visible ? '#ff0000' : '#000000';
    HtmlInnerFactory.html(
      HtmlInnerFactory.html(
        HtmlInnerFactory.html(
          this.el,
          'svg',
          {
            enabled: 'enabled',
            background: 'new 0 0 24 24',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24'
          },
          HtmlInnerFactory.SVG_NS
        ),
        'g',
        undefined,
        HtmlInnerFactory.SVG_NS
      ),
      'rect',
      {
        fill: '#00ff00',
        opacity: '1',
        stroke: stroke,
        'stroke-width': '2',
        width: '24',
        height: '24'
      },
      HtmlInnerFactory.SVG_NS
    );
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    this.model.top.appendChild(this.picker.render());
    this.picker.setColor('#ff0000');
    this.updateColor('fill', '#ff0000');
    return this.el;
  }

  updateColor(attr: string, color: string) {
    (this.el.firstChild?.firstChild?.firstChild as SVGRectElement).setAttribute(attr, color);
    if (attr === 'fill') this.model.draw.color = color;
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
      this.updateColor('stroke', this.model.draw.color);
    } else {
      this.picker.hide();
      this.updateColor('stroke', this.model.draw.color);
    }
  };
}
