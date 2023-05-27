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
import { HtmlComponent } from '../model/pin-view.model';
import { ObjAddHashtagsCommand } from '../../../command/obj/hashtag/obj-add-hashtags.command';
import { PinEditModel } from '../model/pin-edit.model';
import { PinUpdateCommand } from '../../../command/pin/pin-update.command';
import { TextCommentEditorComponent } from './text-comment-editor.component';
import { TextCommentListComponent } from './text-comment-list.component';
import { applyStylesToElement } from '../../../style.utils';
import { fnSha256 } from '../../../fn/fn-sha256';

const elStyles = {
  'min-height': '40px',
  'background-color': '#ffffff'
};

export class TextContainerComponent implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private add: TextCommentEditorComponent;
  private comments: TextCommentListComponent;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
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

    this.model.comments.data.push({ hash: fnSha256(value), value, createdAt: dt, updatedAt: dt });

    await new PinUpdateCommand(this.model.object).execute();
    this.reloadComments();
  };
}
