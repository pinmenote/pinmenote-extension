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
import { CommentEditButton } from './comment-edit.button';
import { CommentRemoveButton } from './comment-remove.button';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';

const elStyles = {
  margin: '10px',
  display: 'flex',
  'flex-direction': 'row'
};

export class CommentActionBar {
  private readonly el: HTMLDivElement;
  constructor(private model: PinEditModel, private removeCallback: () => void, private editCallback: () => void) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    const r = new CommentRemoveButton(this.model, this.removeCallback);
    const e = new CommentEditButton(this.model, this.editCallback);
    this.el.appendChild(e.render());
    this.el.appendChild(r.render());
    applyStylesToElement(this.el, elStyles);
    return this.el;
  }
}
