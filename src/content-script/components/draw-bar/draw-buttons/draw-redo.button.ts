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
import { HtmlComponent } from '../../../model/html.model';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawRedoButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private canRedo = false;

  constructor(private drawBar: DrawBarComponent) {}

  render(): HTMLElement {
    const fill = this.canRedo ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg fill="${fill}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">

<path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
</svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  select(): void {
    this.canRedo = true;
    (this.el.firstChild as SVGElement).setAttribute('fill', '#ff0000');
  }

  unselect(): void {
    this.canRedo = false;
    (this.el.firstChild as SVGElement).setAttribute('fill', '#000000');
  }

  private handleClick = () => {
    this.drawBar.redo();
  };
}
