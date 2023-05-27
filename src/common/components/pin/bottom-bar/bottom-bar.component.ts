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
import { PinEditManager } from '../pin-edit.manager';
import { PinEditModel } from '../model/pin-edit.model';
import { ShowCommentButton } from './buttons/show-comment.button';
import { VideoTimeComponent } from './video-time/video-time.component';
import { applyStylesToElement } from '../../../style.utils';

const elStyles = {
  height: '20px',
  display: 'flex',
  'background-color': '#ffffff',
  'justify-content': 'space-between',
  'align-items': 'center'
};

export class BottomBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el: HTMLDivElement;

  private videoTime: VideoTimeComponent;
  private addComment: ShowCommentButton;

  constructor(edit: PinEditManager, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.videoTime = new VideoTimeComponent(model);
    this.addComment = new ShowCommentButton(edit, model);
  }

  render(): HTMLDivElement {
    const style = Object.assign({ width: `${this.model.rect.width}px` }, elStyles);
    applyStylesToElement(this.el, style);

    this.el.appendChild(this.videoTime.render());
    this.el.appendChild(this.addComment.render());

    return this.el;
  }

  cleanup(): void {
    this.videoTime.cleanup();
    this.addComment.cleanup();
  }

  resize(): void {
    this.el.style.width = `${this.model.rect.width}px`;
  }

  focusin(): void {
    this.el.style.display = 'flex';
  }

  focusout(): void {
    if (this.addComment.isVisible) return;
    this.el.style.display = 'none';
  }
}
