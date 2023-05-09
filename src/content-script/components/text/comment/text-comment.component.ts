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
import { CommentRemoveComponent } from './comment-remove.component';
import { HtmlComponent } from '../../../../common/model/html.model';
import { ObjCommentDto } from '../../../../common/model/obj/obj-pin.dto';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnDateFormat } from '../../../../common/fn/date.format.fn';
import { marked } from 'marked';

const elStyles = {
  display: 'flex',
  'flex-direction': 'row',
  'justify-content': 'space-between',
  'font-size': '1em',
  color: '#000',
  width: '100%'
};

export class TextCommentComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  constructor(private comment: ObjCommentDto, private index: number, private removeCallback: (index: number) => void) {}
  render(): HTMLElement {
    const d = document.createElement('div');
    const r = new CommentRemoveComponent(this.index, this.removeCallback);
    if (this.comment.createdDate) {
      fnDateFormat(new Date(this.comment.createdDate));
    }
    d.innerHTML = marked(this.comment.value);
    this.el.appendChild(d);
    this.el.appendChild(r.render());
    applyStylesToElement(this.el, elStyles);
    return this.el;
  }
}
