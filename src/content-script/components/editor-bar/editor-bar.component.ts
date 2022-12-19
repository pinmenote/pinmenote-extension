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
import { BoldButtonComponent } from './buttons/bold-button.component';
import { BulletListButtonComponent } from './buttons/bullet-list-button.component';
import { BusMessageType } from '@common/model/bus.model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ItalicButtonComponent } from './buttons/italic-button.component';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import { applyStylesToElement } from '@common/style.utils';
import { fnConsoleLog } from '@common/fn/console.fn';

const elStyles = {
  'background-color': '#ffffff00',
  display: 'flex',
  'flex-direction': 'row',
  height: '17px',
  'padding-bottom': '2px',
  'align-items': 'center'
};

export class EditorBarComponent {
  private el = document.createElement('div');

  private bold: BoldButtonComponent = new BoldButtonComponent();
  private italic: ItalicButtonComponent = new ItalicButtonComponent();
  private bulletList: BulletListButtonComponent = new BulletListButtonComponent();

  private marksChangeKey?: string;
  private marks = {
    strong: false,
    em: false
  };

  private editor?: EditorView;

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
    this.bold.setEditor(this.editor);
    this.italic.setEditor(this.editor);
    this.bulletList.setEditor(this.editor);
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);

    this.el.appendChild(this.bold.render());
    this.el.appendChild(this.italic.render());
    this.el.appendChild(this.bulletList.render());

    this.marksChangeKey = TinyEventDispatcher.addListener<EditorState>(
      BusMessageType.CNT_EDITOR_MARKS,
      this.handleMarksChange
    );

    return this.el;
  }

  focusIn(): void {
    this.el.style.backgroundColor = '#ffffffff';
    this.bold.focusIn();
    this.italic.focusIn();
    this.bulletList.focusIn();
  }

  focusOut(): void {
    this.bold.focusOut();
    this.italic.focusOut();
    this.bulletList.focusOut();
    this.el.style.backgroundColor = '#ffffff00';
  }

  cleanup(): void {
    this.bold.cleanup();
    this.italic.cleanup();
    this.bulletList.cleanup();
    if (this.marksChangeKey) TinyEventDispatcher.removeListener(BusMessageType.CNT_EDITOR_MARKS, this.marksChangeKey);
  }

  private handleMarksChange = (event: string, key: string, value: EditorState) => {
    const marks = {
      strong: false,
      em: false
    };
    let forceMark = false;
    if (value.storedMarks && value.storedMarks.length > 0) {
      forceMark = true;
      value.storedMarks.forEach((mark) => {
        if (mark.type.name === 'em') {
          marks.em = true;
        } else if (mark.type.name === 'strong') {
          marks.strong = true;
        }
      });
    } else {
      value.selection.$anchor.marks().forEach((mark) => {
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
  };
}
