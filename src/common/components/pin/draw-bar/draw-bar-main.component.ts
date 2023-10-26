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
import { DrawEditButton } from './draw-main-buttons/draw-edit.button';
import { DrawNewButton } from './draw-main-buttons/draw-new.button';
import { DrawNewCancelButton } from './draw-main-buttons/draw-new-cancel.button';
import { HtmlComponent } from '../model/pin-view.model';
import { PinEditManager } from '../pin-edit.manager';
import { PinEditModel } from '../model/pin-edit.model';
import { applyStylesToElement } from '../../../style.utils';

const barStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none'
};

export class DrawBarMainComponent implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private visible = false;

  private newDraw?: DrawNewButton;
  private editDraw?: DrawEditButton;
  private readonly cancelDraw: DrawNewCancelButton;

  constructor(private edit: PinEditManager, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.model.draw.data
      .loadDraw()
      .then(() => {
        if (this.model.draw.data.currentData && this.model.draw.data.currentData.length > 0) {
          this.editDraw = new DrawEditButton(edit, model);
        } else {
          this.newDraw = new DrawNewButton(edit, model);
        }
        // Add components after load - render function executes first
        if (this.newDraw) this.el.appendChild(this.newDraw.render());
        if (this.editDraw) this.el.appendChild(this.editDraw.render());
        this.el.appendChild(this.cancelDraw.render());
      })
      .catch(() => {
        /* IGNORE */
      });
    this.cancelDraw = new DrawNewCancelButton(edit, model);
  }
  render(): HTMLElement {
    const style = Object.assign({ width: `${this.model.rect.width}px` }, barStyles);
    applyStylesToElement(this.el, style);

    this.adjustTop();

    return this.el;
  }

  cleanup(): void {
    this.newDraw?.cleanup();
    this.editDraw?.cleanup();
  }

  resize(): void {
    this.el.style.width = `${this.model.rect.width}px`;
    this.adjustTop();
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'flex';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  show(): void {
    this.visible = true;
    this.focusin();
  }

  hide(): void {
    this.visible = false;
    this.focusout();
  }

  /**
   * Element is on top of page that's why we show bar overlapping element
   * @private
   */
  private adjustTop(): void {
    if (this.model.rect.y === 0) {
      this.el.style.top = '24px';
    } else {
      this.el.style.top = '-24px';
    }
  }
}
