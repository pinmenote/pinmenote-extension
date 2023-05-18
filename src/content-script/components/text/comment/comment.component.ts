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
import { CommentActionBar } from './comment-action-bar';
import { CommentFooterComponent } from './comment-footer.component';
import { HashtagFindCommand } from '../../../../common/command/obj/hashtag/hashtag-find.command';
import { HtmlComponent } from '../../../model/html.model';
import { ObjCommentDto } from '../../../../common/model/obj/obj-pin.dto';
import { ObjRemoveHashtagsCommand } from '../../../../common/command/obj/hashtag/obj-remove-hashtags.command';
import { ObjUpdateHashtagsCommand } from '../../../../common/command/obj/hashtag/obj-update-hashtags.command';
import { PinModel } from '../../pin.model';
import { PinUpdateCommand } from '../../../../common/command/pin/pin-update.command';
import { TextCommentEditorComponent } from '../text-comment-editor.component';
import { applyStylesToElement } from '../../../../common/style.utils';
import { marked } from 'marked';

const viewStyles = {
  display: 'flex',
  'flex-direction': 'row',
  'justify-content': 'space-between',
  'font-size': '1em',
  color: '#000',
  width: '100%'
};

export class CommentComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');
  private view?: HTMLDivElement;
  private footer: CommentFooterComponent;

  constructor(
    private model: PinModel,
    private comment: ObjCommentDto,
    private index: number,
    private renderCallback: () => void
  ) {
    this.footer = new CommentFooterComponent(comment);
  }
  render(): HTMLElement {
    this.renderRead();
    return this.el;
  }

  renderRead = () => {
    this.renderView();
    const comment = document.createElement('div');
    const value = document.createElement('div');
    value.innerHTML = marked(this.comment.value);
    comment.appendChild(value);
    comment.appendChild(this.footer.render());
    comment.style.marginLeft = '5px';
    comment.style.marginBottom = '5px';
    if (!this.view) return;
    this.view.appendChild(comment);
    const actionBar = new CommentActionBar(this.removeCallback, this.editCallback);
    this.view.appendChild(actionBar.render());
    this.el.appendChild(this.view);
  };

  renderView = () => {
    this.view?.remove();
    this.view = document.createElement('div');
    applyStylesToElement(this.view, viewStyles);
  };

  editCallback = () => {
    this.renderView();
    const comment = document.createElement('div');
    const txt = new TextCommentEditorComponent(
      this.model,
      'Save',
      this.saveCallback,
      'Cancel',
      this.cancelCallback,
      this.comment.value
    );
    txt.create();
    comment.appendChild(txt.render());
    comment.appendChild(this.footer.render());
    comment.style.marginLeft = '5px';
    comment.style.marginBottom = '5px';
    if (!this.view) return;
    this.view.appendChild(comment);
    this.el.appendChild(this.view);
  };

  private saveCallback = async (value: string): Promise<void> => {
    this.comment.updatedAt = Date.now();
    await new ObjUpdateHashtagsCommand(this.model.id, this.comment.value, value).execute();
    this.comment.value = value;
    await new PinUpdateCommand(this.model.object).execute();
    this.renderView();
    this.renderRead();
  };

  private cancelCallback = (): void => {
    this.renderView();
    this.renderRead();
  };

  removeCallback = async (): Promise<void> => {
    const c = this.model.comments.data.splice(this.index, 1);
    const hashtags = new HashtagFindCommand(c[0].value).execute();
    await new ObjRemoveHashtagsCommand(this.model.id, hashtags).execute();
    await new PinUpdateCommand(this.model.object).execute();
    this.renderCallback();
  };
}
