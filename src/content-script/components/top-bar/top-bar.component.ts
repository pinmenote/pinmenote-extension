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
import { HtmlComponent, HtmlComponentFocusable } from '../../../common/model/html.model';
import { ActionCopyButton } from './action-buttons/action-copy.button';
import { ActionDownloadButton } from './action-buttons/action-download.button';
import { ActionDrawButton } from './action-buttons/action-draw.button';
import { ActionPinEditButton } from './action-buttons/action-pin-edit.button';
import { ActionRemoveButton } from './action-buttons/action-remove.button';
import { ObjCanvasDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjRectangleDto } from '../../../common/model/obj/obj-utils.dto';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';

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

const copyIconStyles = {
  right: '54px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

const downloadIconStyles = {
  right: '80px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

const drawIconStyles = {
  left: '0px',
  position: 'absolute',
  'background-color': '#ffffff00'
};

export class TopBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private readonly editIcon: ActionPinEditButton;
  private readonly removeIcon: ActionRemoveButton;
  private readonly copyIcon: ActionCopyButton;
  private readonly downloadIcon: ActionDownloadButton;

  private readonly drawIcon: ActionDrawButton;

  private topMargin = '-24px';
  private canvas?: ObjCanvasDto;

  constructor(private parent: PinComponent, private object: ObjDto<ObjPagePinDto>, private rect: ObjRectangleDto) {
    this.canvas = object.data.snapshot.canvas;
    this.editIcon = new ActionPinEditButton(parent, object);
    this.removeIcon = new ActionRemoveButton(parent);
    this.copyIcon = new ActionCopyButton(parent);
    this.downloadIcon = new ActionDownloadButton(parent);

    this.drawIcon = new ActionDrawButton(parent);
  }

  focusin(): void {
    this.el.style.display = 'inline-block';
    this.adjustTop();
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  moveup(): void {
    if (this.rect.y > 0) {
      this.topMargin = '-48px';
      this.adjustTop();
    }
  }

  movedown(): void {
    this.topMargin = '-24px';
    this.adjustTop();
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, topBarStyles);

    applyStylesToElement(this.el, style);

    // right side
    const removeComponent = this.removeIcon.render();
    this.el.appendChild(removeComponent);
    applyStylesToElement(removeComponent, removeIconStyles);

    const editComponent = this.editIcon.render();
    if (!this.canvas) this.el.appendChild(editComponent);
    applyStylesToElement(editComponent, editIconStyles);

    const copyComponent = this.copyIcon.render();
    this.el.appendChild(copyComponent);
    applyStylesToElement(copyComponent, copyIconStyles);

    const downloadComponent = this.downloadIcon.render();
    this.el.appendChild(downloadComponent);
    applyStylesToElement(downloadComponent, downloadIconStyles);

    // left side
    const drawComponent = this.drawIcon.render();
    this.el.appendChild(drawComponent);
    applyStylesToElement(drawComponent, drawIconStyles);

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

  resize(rect: ObjRectangleDto): void {
    this.rect = rect;
    if (rect.y === 0) this.topMargin = '0px';
    this.el.style.width = `${rect.width}px`;
    this.adjustTop();
  }

  cleanup(): void {
    this.editIcon.cleanup();
    this.removeIcon.cleanup();
    this.copyIcon.cleanup();
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
