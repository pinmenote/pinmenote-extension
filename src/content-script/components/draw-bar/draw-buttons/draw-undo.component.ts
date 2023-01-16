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
import { HtmlComponent } from '../../../../common/model/html.model';
import { applyStylesToElement } from '../../../../common/style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawUndoComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private canUndo = false;

  constructor(private drawBar: DrawBarComponent) {}

  render(): HTMLElement {
    const fill = this.canUndo ? '#ff0000' : '#000000';
    this.el.innerHTML = `<svg fill="${fill}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
<path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
</svg>`;
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  select(): void {
    this.canUndo = true;
    (this.el.firstChild as SVGElement).setAttribute('fill', '#ff0000');
  }

  unselect(): void {
    this.canUndo = false;
    (this.el.firstChild as SVGElement).setAttribute('fill', '#000000');
  }

  private handleClick = () => {
    this.drawBar.undo();
  };
}
