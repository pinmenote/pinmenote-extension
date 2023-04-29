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
import { HtmlComponent } from '../../../common/model/html.model';
import { ObjRectangleDto } from '../../../common/model/obj/obj-utils.dto';
import { TextEditorComponent } from './text-editor.component';

export class TextEditContainerComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private textEditor: TextEditorComponent;
  private saveButton: HTMLButtonElement = document.createElement('button');
  private cancelButton: HTMLButtonElement = document.createElement('button');

  constructor(
    rect: ObjRectangleDto,
    private addCommentCallback: (value: string) => void,
    private cancelCallback: () => void
  ) {
    this.textEditor = new TextEditorComponent(rect);
    this.saveButton.innerText = 'Add';
    this.saveButton.style.color = '#000000';
    this.saveButton.style.backgroundColor = '#ffffff';
    this.cancelButton.innerText = 'Cancel';
    this.cancelButton.style.color = '#000000';
    this.cancelButton.style.backgroundColor = '#ffffff';
  }

  render(): HTMLElement {
    const text = this.textEditor.render();
    this.saveButton.addEventListener('click', this.handleSaveClick);
    this.cancelButton.addEventListener('click', this.handleCancelClick);
    this.el.appendChild(text);
    this.el.appendChild(this.saveButton);
    return this.el;
  }

  create(): void {
    this.textEditor.create();
  }

  focus(): void {
    this.textEditor.focus();
  }

  resize(rect: ObjRectangleDto): void {
    this.textEditor.resize(rect);
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
    this.addCommentCallback(this.textEditor.value);
    this.textEditor.cleanup();
    this.textEditor.create();
  };

  private handleCancelClick = () => {
    this.cancelCallback();
  };
}
