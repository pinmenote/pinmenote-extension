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
import { CommentComponent } from './comment/comment.component';
import { HtmlComponent } from '../model/pin-view.model';
import { PinEditModel } from '../model/pin-edit.model';
import { PinGetCommentCommand } from '../../../command/pin/comment/pin-get-comment.command';
import { applyStylesToElement } from '../../../style.utils';

const elStyles = {
  'background-color': '#ffffff'
};

export class TextCommentListComponent implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);
    this.renderComments();
    return this.el;
  }

  renderComments = (): void => {
    while(this.el.firstChild) this.el.removeChild(this.el.firstChild);
    this.model.comments.data.forEach(async (hash, index) => {
      const comment = await new PinGetCommentCommand(hash).execute();
      if (comment) {
        const c = new CommentComponent(this.model, comment, index, this.renderComments);
        this.el.appendChild(c.render());
      }
    });
  };
}
