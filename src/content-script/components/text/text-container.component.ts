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
import { PinObject } from '../../../common/model/pin.model';
import { TextBarComponent } from '../text-bar/text-bar.component';
import { TextEditorComponent } from './text-editor.component';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class TextContainerComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el = document.createElement('div');

  readonly textBar: TextBarComponent;
  private textEditor: TextEditorComponent;

  constructor(private object: PinObject, rect: PinRectangle) {
    this.textBar = new TextBarComponent();
    this.textEditor = new TextEditorComponent(object, rect, this);
  }

  render(): HTMLElement {
    const bar = this.textBar.render();
    const text = this.textEditor.render();
    this.el.appendChild(bar);
    this.el.appendChild(text);
    this.textBar.setEditor(this.textEditor.editor);
    return this.el;
  }

  focus(goto = false): void {
    this.textEditor.focus(goto);
  }

  resize(rect: PinRectangle): void {
    this.textEditor.resize(rect);
    this.textBar.resize(rect);
  }

  show(): void {
    this.el.style.display = 'inline-block';
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
