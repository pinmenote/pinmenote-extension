/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { applyStylesToElement } from '../../../../common/style.utils';
import { editorBarButtonStyles } from './editor-bar-button.styles';
import { schema } from 'prosemirror-markdown';
import { wrapInList } from 'prosemirror-schema-list';

export class TextNumericListButton {
  private el = document.createElement('div');
  private listCommand?: Command;

  private editor?: EditorView;

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
  }

  render(): HTMLDivElement {
    this.el.innerText = '1';
    this.el.addEventListener('mousedown', this.handleMouseDown);
    this.el.addEventListener('click', this.handleListClick);
    applyStylesToElement(this.el, editorBarButtonStyles);

    this.listCommand = wrapInList(schema.nodes.ordered_list);

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
