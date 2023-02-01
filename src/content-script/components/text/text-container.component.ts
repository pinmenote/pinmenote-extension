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
import { HtmlComponent, HtmlComponentFocusable } from '../../../common/model/html.model';
import { ObjDto } from '../../../common/model/obj.model';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { ObjRectangleDto } from '../../../common/model/obj-utils.model';
import { TextBarComponent } from '../text-bar/text-bar.component';
import { TextEditorComponent } from './text-editor.component';

export class TextContainerComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el = document.createElement('div');

  readonly textBar: TextBarComponent;
  private textEditor: TextEditorComponent;

  constructor(private object: ObjDto<ObjPagePinDto>, rect: ObjRectangleDto) {
    this.textBar = new TextBarComponent();
    this.textEditor = new TextEditorComponent(object, rect, this);
  }

  render(): HTMLElement {
    const bar = this.textBar.render();
    this.el.appendChild(bar);

    const text = this.textEditor.render();
    this.el.appendChild(text);

    this.textBar.setEditor(this.textEditor.editor);
    this.el.style.display = 'none';

    return this.el;
  }

  focus(goto = false): void {
    this.textEditor.focus(goto);
  }

  resize(rect: ObjRectangleDto): void {
    this.textEditor.resize(rect);
    this.textBar.resize(rect);
  }

  show(): void {
    this.el.style.display = 'inline-block';
    this.textEditor.focus(true);
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  cleanup(): void {
    this.textEditor.cleanup();
    this.textBar.cleanup();
  }

  focusin(): void {
    this.textEditor.focusin();
    this.textBar.focusin();
  }

  focusout(): void {
    this.textEditor.focusout();
    this.textBar.focusout();
  }
}
