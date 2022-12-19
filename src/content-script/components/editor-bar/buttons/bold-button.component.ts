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
import { applyStylesToElement } from '@common/style.utils';
import { editorBarButtonStyles } from './editor-bar-button.styles';
import { schema } from 'prosemirror-markdown';
import { toggleMark } from 'prosemirror-commands';

export class BoldButtonComponent {
  private boldButton = document.createElement('div');
  private boldCommand?: Command;

  private clicked = false;
  private selected = false;

  private editor?: EditorView;

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
  }

  render(): HTMLDivElement {
    this.boldButton.innerText = 'B';
    this.boldButton.addEventListener('mousedown', this.handleMouseDown);
    this.boldButton.addEventListener('click', this.handleBoldClick);
    applyStylesToElement(this.boldButton, editorBarButtonStyles);
    this.boldButton.style.fontWeight = 'bold';
    this.boldButton.style.display = 'none';

    this.boldCommand = toggleMark(schema.marks.strong);

    return this.boldButton;
  }

  cleanup(): void {
    this.boldButton.removeEventListener('click', this.handleBoldClick);
    this.boldButton.removeEventListener('mousedown', this.handleMouseDown);
  }

  focusIn(): void {
    this.boldButton.style.display = 'table-cell';
  }

  focusOut(): void {
    this.boldButton.style.display = 'none';
  }

  select(force = false): void {
    if (this.clicked && !force) {
      this.clicked = false;
      return;
    }
    this.boldButton.style.backgroundColor = '#000000';
    this.boldButton.style.color = '#ffffff';
    this.selected = true;
  }

  unselect(force = false): void {
    if (this.clicked && !force) {
      this.clicked = false;
      return;
    }
    this.boldButton.style.backgroundColor = '#ffffff';
    this.boldButton.style.color = '#000000';
    this.selected = false;
  }

  private handleBoldClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    //eslint-disable-next-line @typescript-eslint/unbound-method
    if (this.editor && this.boldCommand) this.boldCommand(this.editor.state, this.editor.dispatch, this.editor);

    this.selected ? this.unselect(true) : this.select(true);
    this.clicked = true;
  };

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
}
