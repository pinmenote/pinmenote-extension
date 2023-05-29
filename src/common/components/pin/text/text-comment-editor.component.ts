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
import { ContentButton } from '../base/content-button';
import { HtmlComponent } from '../model/pin-view.model';
import { PinEditModel } from '../model/pin-edit.model';
import { TextEditorComponent } from './text-editor.component';
import prosemirrorCss from 'bundle-text:../../../../css/prosemirror.css';

export class TextCommentEditorComponent implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;
  private readonly shadow: ShadowRoot;
  private readonly prosemirrorStyle: HTMLStyleElement;

  private textEditor: TextEditorComponent;
  private readonly saveButton: ContentButton;
  private readonly cancelButton?: ContentButton;

  constructor(
    model: PinEditModel,
    saveLabel: string,
    private saveCallback: (value: string) => void,
    cancelLabel?: string,
    cancelCallback?: () => void,
    initialValue = ''
  ) {
    this.el = model.doc.document.createElement('div');
    this.prosemirrorStyle = model.doc.document.createElement('style');
    this.prosemirrorStyle.textContent = prosemirrorCss;
    this.shadow = this.el.attachShadow({ mode: 'closed' });
    this.textEditor = new TextEditorComponent(initialValue, model);
    this.saveButton = new ContentButton(model.doc, saveLabel, this.handleSaveClick);
    if (cancelLabel && cancelCallback) this.cancelButton = new ContentButton(model.doc, cancelLabel, cancelCallback);
  }

  render(): HTMLElement {
    const text = this.textEditor.render();
    this.shadow.appendChild(this.prosemirrorStyle);
    this.shadow.appendChild(text);
    this.shadow.appendChild(this.saveButton.render());
    if (this.cancelButton) this.shadow.appendChild(this.cancelButton.render());
    return this.el;
  }

  create(): void {
    this.textEditor.create();
  }

  focus(): void {
    this.textEditor.focus();
  }

  resize(): void {
    this.textEditor.resize();
  }

  show(): void {
    this.el.style.display = 'inline-block';
    this.textEditor.focus();
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  cleanup(): void {
    this.textEditor.cleanup();
  }

  private handleSaveClick = () => {
    this.saveCallback(this.textEditor.value);
    this.textEditor.cleanup();
    this.textEditor.create();
  };
}
