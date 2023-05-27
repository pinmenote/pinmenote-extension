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
import { ObjCommentDto } from '../../../../model/obj/obj-pin.dto';
import { PinEditModel } from '../../model/pin-edit.model';
import { fnDateFormat } from '../../../../fn/fn-date-format';

export class CommentFooterComponent {
  private readonly el: HTMLDivElement;

  constructor(private model: PinEditModel, private comment: ObjCommentDto) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    this.el.style.fontSize = '0.7em';
    this.el.innerHTML = 'updated ' + fnDateFormat(new Date(this.comment.updatedAt));
    return this.el;
  }
}
