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
import { HtmlComponent } from '../../model/html.model';
import { ObjAddHashtagsCommand } from '../../../common/command/obj/hashtag/obj-add-hashtags.command';
import { PinModel } from '../pin.model';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import { TextCommentEditorComponent } from './text-comment-editor.component';
import { TextCommentListComponent } from './text-comment-list.component';
import { applyStylesToElement } from '../../../common/style.utils';

const elStyles = {
  'min-height': '40px',
  'background-color': '#ffffff'
};

export class TextContainerComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private add: TextCommentEditorComponent;
  private comments: TextCommentListComponent;

  constructor(private model: PinModel) {
    this.add = new TextCommentEditorComponent(model, 'Add', this.addCommentCallback);
    this.comments = new TextCommentListComponent(model);
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);
    this.el.appendChild(this.comments.render());
    const text = this.add.render();
    this.el.appendChild(text);
    this.el.style.display = 'none';

    return this.el;
  }

  focus(): void {
    this.add.focus();
  }

  resize(): void {
    this.add.resize();
  }

  show(): void {
    this.el.style.display = 'inline-block';
    this.add.create();
  }

  hide(): void {
    this.el.style.display = 'none';
    this.add.cleanup();
  }

  cleanup(): void {
    this.add.cleanup();
  }

  reloadComments(): void {
    this.comments.renderComments();
  }

  private addCommentCallback = async (value: string): Promise<void> => {
    if (!value) return;
    await new ObjAddHashtagsCommand(this.model.id, value).execute();
    const dt = Date.now();

    this.model.comments.data.push({ value, createdAt: dt, updatedAt: dt });

    await new PinUpdateCommand(this.model.object).execute();
    this.reloadComments();
  };
}
