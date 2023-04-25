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
import { EditBarParentButton } from './edit-bar-buttons/edit-bar-parent.button';
import { EditBarSnapshotButton } from './edit-bar-buttons/edit-bar-snapshot.button';
import { ObjRectangleDto } from '../../../common/model/obj/obj-utils.dto';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';

const editBarStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none',
  'flex-direction': 'row',
  'justify-content': 'flex-end'
};

export class PinEditBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private visible = false;

  private parentButton: EditBarParentButton;
  private snapshotButton: EditBarSnapshotButton;

  constructor(private parent: PinComponent, private rect: ObjRectangleDto) {
    this.parentButton = new EditBarParentButton(parent);
    this.snapshotButton = new EditBarSnapshotButton(parent);
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, editBarStyles);
    applyStylesToElement(this.el, style);

    this.adjustTop();

    this.el.appendChild(this.snapshotButton.render());
    this.el.appendChild(this.parentButton.render());

    return this.el;
  }

  cleanup(): void {
    this.parentButton.cleanup();
    this.snapshotButton.cleanup();
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

  resize(rect: ObjRectangleDto): void {
    this.rect = rect;
    this.el.style.width = `${rect.width}px`;
    this.adjustTop();
  }

  /**
   * Element is on top of page that's why we show bar overlapping element
   * @private
   */
  private adjustTop(): void {
    if (this.rect.y === 0) {
      this.el.style.top = '24px';
    } else {
      this.el.style.top = '-24px';
    }
  }
}
