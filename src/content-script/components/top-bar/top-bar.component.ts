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
import { BoldButtonComponent } from './editor-buttons/bold-button.component';
import { BulletListButtonComponent } from './editor-buttons/bullet-list-button.component';
import { BusMessageType } from '../../../common/model/bus.model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ItalicButtonComponent } from './editor-buttons/italic-button.component';
import { ParentIconComponent } from './action-buttons/parent-icon.component';
import { PinComponent } from '../pin.component';
import { PinObject } from '../../../common/model/pin.model';
import { RemoveIconComponent } from './action-buttons/remove-icon.component';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { applyStylesToElement } from '../../../common/style.utils';
import { fnConsoleLog } from '../../../common/fn/console.fn';

const elStyles = {
  'background-color': '#ffffff00',
  display: 'flex',
  'flex-direction': 'row',
  'justify-content': 'space-between',
  height: '18px',
  margin: '0',
  padding: '5px 5px 5px 5px',
  'align-items': 'center'
};

const toolsStyles = {
  display: 'flex',
  'flex-direction': 'row',
  'align-items': 'center'
};

const editorStyles = {
  display: 'flex',
  'flex-direction': 'row',
  'align-items': 'center'
};

export class TopBarComponent {
  private el = document.createElement('div');
  private editbar = document.createElement('div');
  private toolbar = document.createElement('div');

  private bold: BoldButtonComponent;
  private italic: ItalicButtonComponent;
  private bulletList: BulletListButtonComponent;

  private parentIcon: ParentIconComponent;
  private removeIcon: RemoveIconComponent;

  private marksChangeKey?: string;
  private marks = {
    strong: false,
    em: false
  };

  private editor?: EditorView;

  constructor(private pin: PinObject, private parent: PinComponent) {
    this.bold = new BoldButtonComponent();
    this.italic = new ItalicButtonComponent();
    this.bulletList = new BulletListButtonComponent();

    this.parentIcon = new ParentIconComponent(pin, parent);
    this.removeIcon = new RemoveIconComponent(pin);
  }

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
    this.bold.setEditor(this.editor);
    this.italic.setEditor(this.editor);
    this.bulletList.setEditor(this.editor);
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);

    applyStylesToElement(this.editbar, editorStyles);
    this.editbar.appendChild(this.bold.render());
    this.editbar.appendChild(this.italic.render());
    this.editbar.appendChild(this.bulletList.render());

    applyStylesToElement(this.toolbar, toolsStyles);
    this.toolbar.appendChild(this.parentIcon.render());
    this.toolbar.appendChild(this.removeIcon.render());

    this.el.appendChild(this.editbar);
    this.el.appendChild(this.toolbar);

    this.editbar.style.display = 'none';
    this.toolbar.style.display = 'none';

    this.marksChangeKey = TinyEventDispatcher.addListener<EditorState>(
      BusMessageType.CNT_EDITOR_MARKS,
      this.handleMarksChange
    );

    return this.el;
  }

  focusin(): void {
    this.el.style.backgroundColor = '#ffffffff';
    this.editbar.style.display = 'flex';
    this.toolbar.style.display = 'flex';
  }

  focusout(): void {
    this.editbar.style.display = 'none';
    this.toolbar.style.display = 'none';
    this.el.style.backgroundColor = '#ffffff00';
  }

  cleanup(): void {
    this.bold.cleanup();
    this.italic.cleanup();
    this.bulletList.cleanup();

    this.parentIcon.cleanup();
    this.removeIcon.cleanup();

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
