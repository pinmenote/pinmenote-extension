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
import { Command } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';
import { editorBarButtonStyles } from './editor-bar-button.styles';
import { schema } from 'prosemirror-markdown';
import { wrapInList } from 'prosemirror-schema-list';

export class TextBulletListButton {
  private readonly el: HTMLDivElement;
  private listCommand?: Command;

  private editor?: EditorView;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
  }

  render(): HTMLDivElement {
    const li = this.model.doc.document.createElement('li');
    li.style.paddingLeft = '5px';
    li.style.paddingBottom = '10px';
    this.el.appendChild(li);
    this.el.addEventListener('mousedown', this.handleMouseDown);
    this.el.addEventListener('click', this.handleListClick);
    applyStylesToElement(this.el, editorBarButtonStyles);

    this.listCommand = wrapInList(schema.nodes.bullet_list);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleListClick);
    this.el.removeEventListener('mousedown', this.handleMouseDown);
  }

  private handleListClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    //eslint-disable-next-line @typescript-eslint/unbound-method
    if (this.editor && this.listCommand) this.listCommand(this.editor.state, this.editor.dispatch, this.editor);
  };

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
}
