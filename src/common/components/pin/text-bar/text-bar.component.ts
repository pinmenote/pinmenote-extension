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
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { HtmlComponent } from '../model/pin-view.model';
import { ObjRectangleDto } from '../../../model/obj/obj-utils.dto';
import { PinEditModel } from '../model/pin-edit.model';
import { TextBoldButton } from './text-bar-buttons/text-bold.button';
import { TextBulletListButton } from './text-bar-buttons/text-bullet-list.button';
import { TextItalicButton } from './text-bar-buttons/text-italic.button';
import { TextNumericListButton } from './text-bar-buttons/text-numeric-list.button';
import { applyStylesToElement } from '../../../style.utils';
import { fnConsoleLog } from '../../../fn/fn-console';

const elStyles = {
  display: 'flex',
  'flex-direction': 'row',
  'align-items': 'center',
  'background-color': '#ffffff',
  color: '#000000',
  height: '24px'
};

export class TextBarComponent implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  private bold: TextBoldButton;
  private italic: TextItalicButton;
  private bulletList: TextBulletListButton;
  private numericList: TextNumericListButton;

  private marks = {
    strong: false,
    em: false
  };

  private editor?: EditorView;

  constructor(model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.bold = new TextBoldButton(model);
    this.italic = new TextItalicButton(model);
    this.bulletList = new TextBulletListButton(model);
    this.numericList = new TextNumericListButton(model);
  }

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
    this.bold.setEditor(this.editor);
    this.italic.setEditor(this.editor);
    this.bulletList.setEditor(this.editor);
    this.numericList.setEditor(this.editor);
  }

  setState(state: EditorState): void {
    const marks = {
      strong: false,
      em: false
    };
    let forceMark = false;
    if (state.storedMarks && state.storedMarks.length > 0) {
      forceMark = true;
      state.storedMarks.forEach((mark) => {
        if (mark.type.name === 'em') {
          marks.em = true;
        } else if (mark.type.name === 'strong') {
          marks.strong = true;
        }
      });
    } else {
      state.selection.$anchor.marks().forEach((mark) => {
        if (mark.type.name === 'em') {
          marks.em = true;
        } else if (mark.type.name === 'strong') {
          marks.strong = true;
        } else {
          fnConsoleLog('UNSUPPORTED MARK :', mark.type.name);
        }
      });
    }
    Object.entries(marks).forEach(([key, val]) => {
      if (key === 'strong') {
        val ? this.bold.select(forceMark) : this.bold.unselect(forceMark);
      } else if (key === 'em') {
        val ? this.italic.select(forceMark) : this.italic.unselect(forceMark);
      }
    });
    this.marks = marks;
  }

  render(): HTMLElement {
    this.el.appendChild(this.bold.render());
    this.el.appendChild(this.italic.render());
    this.el.appendChild(this.bulletList.render());
    this.el.appendChild(this.numericList.render());

    applyStylesToElement(this.el, elStyles);

    return this.el;
  }

  resize(rect: ObjRectangleDto): void {
    this.el.style.width = `${rect.width}px`;
  }

  focusin(): void {
    this.el.style.display = 'flex';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  cleanup(): void {
    this.bold.cleanup();
    this.italic.cleanup();
    this.bulletList.cleanup();
    this.numericList.cleanup();
  }
}
