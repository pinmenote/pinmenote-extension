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
import { HtmlComponent, HtmlComponentFocusable } from '../model/pin-view.model';
import { ActionDownloadButton } from './action-buttons/action-download.button';
import { ActionDrawButton } from './action-buttons/draw/action-draw.button';
import { ActionDrawVisibleButton } from './action-buttons/draw/action-draw-visible.button';
import { ActionPinEditButton } from './action-buttons/action-pin-edit.button';
import { ActionRemoveButton } from './action-buttons/action-remove.button';
import { PinEditManager } from '../pin-edit.manager';
import { PinEditModel } from '../model/pin-edit.model';
import { applyStylesToElement } from '../../../style.utils';

const topBarStyles = {
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff'
};

const removeIconStyles = {
  right: `0px`,
  position: 'absolute',
  'background-color': '#ffffff00'
};

const editIconStyles = {
  right: `26px`,
  position: 'absolute',
  'background-color': '#ffffff00'
};

const downloadIconStyles = {
  right: '54px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

const drawIconStyles = {
  left: '0px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

const drawVisibleIconStyles = {
  left: '24px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

export class TopBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el: HTMLDivElement;

  private readonly editIcon: ActionPinEditButton;
  private readonly removeIcon: ActionRemoveButton;
  private readonly downloadIcon: ActionDownloadButton;

  private readonly drawIcon: ActionDrawButton;
  readonly drawVisibleIcon: ActionDrawVisibleButton;

  private topMargin = '-24px';

  constructor(edit: PinEditManager, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.editIcon = new ActionPinEditButton(edit, model);
    this.removeIcon = new ActionRemoveButton(model);
    this.downloadIcon = new ActionDownloadButton(edit, model);

    this.drawIcon = new ActionDrawButton(edit, model);
    this.drawVisibleIcon = new ActionDrawVisibleButton(edit, model);
  }

  focusin(): void {
    this.el.style.display = 'inline-block';
    this.adjustTop();
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  moveup(): void {
    if (this.model.rect.y > 0) {
      this.topMargin = '-48px';
      this.adjustTop();
    }
  }

  movedown(): void {
    this.topMargin = '-24px';
    this.adjustTop();
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.model.rect.width}px` }, topBarStyles);

    applyStylesToElement(this.el, style);

    // right side
    const removeComponent = this.removeIcon.render();
    this.el.appendChild(removeComponent);
    applyStylesToElement(removeComponent, removeIconStyles);

    if (!this.model.canvas) {
      const editComponent = this.editIcon.render();
      this.el.appendChild(editComponent);
      applyStylesToElement(editComponent, editIconStyles);
    }

    const downloadComponent = this.downloadIcon.render();
    this.el.appendChild(downloadComponent);
    applyStylesToElement(downloadComponent, downloadIconStyles);

    // left side
    const draw = this.drawIcon.render();
    this.el.appendChild(draw);
    applyStylesToElement(draw, drawIconStyles);

    const drawVisible = this.drawVisibleIcon.render();
    this.el.appendChild(drawVisible);
    applyStylesToElement(drawVisible, drawVisibleIconStyles);

    this.adjustTop();

    return this.el;
  }

  downloadTurnoff(): void {
    this.downloadIcon.turnoff();
  }

  drawTurnoff(): void {
    this.drawIcon.turnoff();
  }

  editTurnOff(): void {
    this.editIcon.turnoff();
  }

  resize(): void {
    if (this.model.rect.y === 0) this.topMargin = '0px';
    this.el.style.width = `${this.model.rect.width}px`;
    this.adjustTop();
  }

  cleanup(): void {
    this.editIcon.cleanup();
    this.removeIcon.cleanup();
    this.downloadIcon.cleanup();

    this.drawIcon.cleanup();
  }

  /**
   * Element is on top of page that's why we show bar overlapping element
   * @private
   */
  private adjustTop(): void {
    this.el.style.top = this.topMargin;
  }
}
