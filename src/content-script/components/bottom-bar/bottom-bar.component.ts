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
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjRectangleDto } from '../../../common/model/obj/obj-utils.dto';
import { PinComponent } from '../pin.component';
import { ShowCommentButton } from './buttons/show-comment.button';
import { VideoTimeComponent } from './video-time/video-time.component';
import { applyStylesToElement } from '../../../common/style.utils';

const elStyles = {
  height: '20px',
  display: 'flex',
  'background-color': '#ffffff',
  'justify-content': 'space-between',
  'align-items': 'center'
};

export class BottomBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el = document.createElement('div');

  private videoTime: VideoTimeComponent;
  private addComment: ShowCommentButton;

  constructor(private parent: PinComponent, private object: ObjDto<ObjPagePinDto>, private rect: ObjRectangleDto) {
    this.videoTime = new VideoTimeComponent(object.data.snapshot);
    this.addComment = new ShowCommentButton(parent);
  }

  render(): HTMLDivElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, elStyles);
    applyStylesToElement(this.el, style);

    this.el.appendChild(this.videoTime.render());
    this.el.appendChild(this.addComment.render());

    return this.el;
  }

  cleanup(): void {
    this.videoTime.cleanup();
    this.addComment.cleanup();
  }

  resize(rect: ObjRectangleDto): void {
    this.rect = rect;
    this.el.style.width = `${rect.width}px`;
  }

  focusin(): void {
    this.el.style.display = 'flex';
  }

  focusout(): void {
    if (this.addComment.isVisible) return;
    this.el.style.display = 'none';
  }
}
