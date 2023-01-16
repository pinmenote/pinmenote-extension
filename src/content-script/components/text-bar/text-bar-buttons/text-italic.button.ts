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
import { toggleMark } from 'prosemirror-commands';

export class TextItalicButton {
  private el = document.createElement('div');
  private italicCommand?: Command;

  private clicked = false;
  private selected = false;

  private editor?: EditorView;

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
  }

  render(): HTMLDivElement {
    this.el.innerText = 'I';
    this.el.addEventListener('mousedown', this.handleMouseDown);
    this.el.addEventListener('click', this.handleItalicClick);
    applyStylesToElement(this.el, editorBarButtonStyles);
    this.el.style.fontStyle = 'italic';

    this.italicCommand = toggleMark(schema.marks.em);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleItalicClick);
    this.el.removeEventListener('mousedown', this.handleMouseDown);
  }

  select(force = false): void {
    if (this.clicked && !force) {
      this.clicked = false;
      return;
    }
    this.el.style.backgroundColor = '#000000';
    this.el.style.color = '#ffffff';
    this.selected = true;
  }

  unselect(force = false): void {
    if (this.clicked && !force) {
      this.clicked = false;
      return;
    }
    this.el.style.backgroundColor = '#ffffff';
    this.el.style.color = '#000000';
    this.selected = false;
  }

  private handleItalicClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    //eslint-disable-next-line @typescript-eslint/unbound-method
    if (this.editor && this.italicCommand) this.italicCommand(this.editor.state, this.editor.dispatch, this.editor);

    this.selected ? this.unselect(true) : this.select(true);
    this.clicked = true;
  };

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
}
