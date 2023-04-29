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
import { HashtagFindCommand } from '../../../common/command/obj/hashtag/hashtag-find.command';
import { HtmlComponent } from '../../../common/model/html.model';
import { ObjRemoveHashtagsCommand } from '../../../common/command/obj/hashtag/obj-remove-hashtags.command';
import { PinComponent } from '../pin.component';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import { TextCommentComponent } from './comment/text-comment.component';
import { applyStylesToElement } from '../../../common/style.utils';

const elStyles = {
  'background-color': '#ffffff'
};

export class TextCommentListComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  constructor(private parent: PinComponent) {}

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);
    this.renderComments();
    return this.el;
  }

  renderComments(): void {
    this.el.innerHTML = '';
    this.parent.object.data.comments.data.forEach((c, index) => {
      this.el.appendChild(new TextCommentComponent(c, index, this.handleRemoveComment).render());
    });
  }

  handleRemoveComment = async (index: number): Promise<void> => {
    const c = this.parent.object.data.comments.data.splice(index, 1);
    const hashtags = new HashtagFindCommand(c[0].value).execute();
    await new ObjRemoveHashtagsCommand(this.parent.object.id, hashtags).execute();
    await new PinUpdateCommand(this.parent.object).execute();
    this.renderComments();
  };
}
