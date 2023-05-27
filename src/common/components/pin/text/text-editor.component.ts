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
import { EditorView } from 'prosemirror-view';
import { HtmlComponent } from '../model/pin-view.model';
import { PinEditModel } from '../model/pin-edit.model';
import { createTextEditorState } from '../../text-editor/text.editor.state';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';

export class TextEditorComponent implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private editorView?: EditorView;

  constructor(private initialValue: string, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  get value(): string {
    if (!this.editorView) return '';
    return defaultMarkdownSerializer.serialize(this.editorView?.state.doc);
  }

  render(): HTMLElement {
    this.resize();
    return this.el;
  }

  cleanup(): void {
    this.editorView?.destroy();
  }

  resize(): void {
    this.el.style.width = `${this.model.rect.width}px`;
  }

  focus(): void {
    this.editorView?.focus();
  }

  create(): void {
    let state = createTextEditorState(this.initialValue);
    this.editorView = new EditorView(this.el, {
      state,
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        event.stopImmediatePropagation();
      },
      dispatchTransaction: (tx) => {
        state = state.apply(tx);
        this.editorView?.updateState(state);
      }
    });
  }
}
