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
import { HtmlComponent } from '../../../common/model/html.model';
import { TextBoldButton } from './text-bar-buttons/text-bold.button';
import { TextBulletListButton } from './text-bar-buttons/text-bullet-list.button';
import { TextItalicButton } from './text-bar-buttons/text-italic.button';
import { TextNumericListButton } from './text-bar-buttons/text-numeric-list.button';
import { applyStylesToElement } from '../../../common/style.utils';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const elStyles = {
  display: 'flex',
  'flex-direction': 'row',
  'align-items': 'center',
  'background-color': '#ffffff',
  color: '#000000',
  height: '24px',
  'padding-left': '5px'
};

export class TextBarComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private bold: TextBoldButton;
  private italic: TextItalicButton;
  private bulletList: TextBulletListButton;
  private numericList: TextNumericListButton;

  private marks = {
    strong: false,
    em: false
  };

  private editor?: EditorView;

  constructor() {
    this.bold = new TextBoldButton();
    this.italic = new TextItalicButton();
    this.bulletList = new TextBulletListButton();
    this.numericList = new TextNumericListButton();
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

  resize(rect: PinRectangle): void {
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
