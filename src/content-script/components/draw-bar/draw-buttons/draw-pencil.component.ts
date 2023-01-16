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
import { DrawToolDto } from '../../../../common/model/obj-draw.model';
import { HtmlComponent } from '../../../../common/model/html.model';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawPencilComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private selected = false;

  constructor(private drawBar: DrawBarComponent) {}

  render(): HTMLElement {
    const fill = this.selected ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="${fill}" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
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
      this.drawBar.setTool(DrawToolDto.Pencil);
    }
  };
}
