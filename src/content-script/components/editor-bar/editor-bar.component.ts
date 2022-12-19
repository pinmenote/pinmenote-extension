import { Command, EditorState } from 'prosemirror-state';
import { BusMessageType } from '@common/model/bus.model';
import { EditorView } from 'prosemirror-view';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import { applyStylesToElement } from '@common/style.utils';
import { schema } from 'prosemirror-markdown';
import { toggleMark } from 'prosemirror-commands';

const buttonStyles = {
  color: '#000000',
  userSelect: 'none',
  cursor: 'pointer',
  'margin-right': '3px',
  padding: '0',
  'vertical-align': 'middle',
  width: '15px',
  height: '15px',
  'font-size': '0.8em',
  'text-align': 'center',
  border: '1px solid #000000',
  'border-radius': '2px'
};

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

  private boldButton = document.createElement('div');
  private boldCommand?: Command;

  private italicButton = document.createElement('div');
  private italicCommand?: Command;

  private marksChangeKey?: string;
  private marks = {
    strong: false,
    em: false
  };

  private click = {
    strong: false,
    em: false
  };

  private editor?: EditorView;

  setEditor(editor: EditorView | undefined): void {
    this.editor = editor;
  }

  render(): HTMLElement {
    applyStylesToElement(this.el, elStyles);

    this.boldButton.innerText = 'B';
    this.boldButton.addEventListener('mousedown', this.handleMouseDown);
    this.boldButton.addEventListener('click', this.handleBoldClick);
    applyStylesToElement(this.boldButton, buttonStyles);
    this.boldButton.style.fontWeight = 'bold';
    this.boldButton.style.display = 'none';

    this.boldCommand = toggleMark(schema.marks.strong);

    this.italicButton.innerText = 'I';
    this.italicButton.addEventListener('mousedown', this.handleMouseDown);
    this.italicButton.addEventListener('click', this.handleItalicClick);
    applyStylesToElement(this.italicButton, buttonStyles);
    this.italicButton.style.fontStyle = 'italic';
    this.italicButton.style.display = 'none';

    this.italicCommand = toggleMark(schema.marks.em);

    this.el.appendChild(this.boldButton);
    this.el.appendChild(this.italicButton);

    this.marksChangeKey = TinyEventDispatcher.addListener<EditorState>(
      BusMessageType.CNT_EDITOR_MARKS,
      this.handleMarksChange
    );

    return this.el;
  }

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  focusIn(): void {
    this.el.style.backgroundColor = '#ffffffff';
    this.boldButton.style.display = 'table-cell';
    this.italicButton.style.display = 'table-cell';
  }

  focusOut(): void {
    this.boldButton.style.display = 'none';
    this.italicButton.style.display = 'none';
    this.el.style.backgroundColor = '#ffffff00';
  }

  cleanup(): void {
    this.boldButton.removeEventListener('click', this.handleBoldClick);
    this.italicButton.removeEventListener('click', this.handleItalicClick);
    if (this.marksChangeKey) TinyEventDispatcher.removeListener(BusMessageType.CNT_EDITOR_MARKS, this.marksChangeKey);
  }

  private handleItalicClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    //eslint-disable-next-line @typescript-eslint/unbound-method
    if (this.editor && this.italicCommand) this.italicCommand(this.editor.state, this.editor.dispatch, this.editor);

    this.marks.em = !this.marks.em;
    this.click.em = true;
    this.marks.em ? this.markSelected(this.italicButton) : this.markUnselected(this.italicButton);
  };

  private handleBoldClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    //eslint-disable-next-line @typescript-eslint/unbound-method
    if (this.editor && this.boldCommand) this.boldCommand(this.editor.state, this.editor.dispatch, this.editor);

    this.marks.strong = !this.marks.strong;
    this.click.strong = true;
    this.marks.strong ? this.markSelected(this.boldButton) : this.markUnselected(this.boldButton);
  };

  private handleMarksChange = (event: string, key: string, value: EditorState) => {
    const marks = {
      strong: false,
      em: false
    };
    value.selection.$anchor.marks().forEach((mark) => {
      if (mark.type.name === 'em') {
        marks.em = true;
      } else if (mark.type.name === 'strong') {
        marks.strong = true;
      }
    });
    if (value.storedMarks && value.storedMarks.length > 0) {
      value.storedMarks.forEach((mark) => {
        if (mark.type.name === 'em') {
          marks.em = true;
        } else if (mark.type.name === 'strong') {
          marks.strong = true;
        }
      });
    } else {
      Object.entries(this.click).forEach(([key, val]) => {
        if (key === 'strong' && val) {
          marks.strong = !marks.strong;
        } else if (key === 'em' && val) {
          marks.em = !marks.em;
        }
      });
    }
    Object.entries(marks).forEach(([key, val]) => {
      if (key === 'strong') {
        val ? this.markSelected(this.boldButton) : this.markUnselected(this.boldButton);
      } else if (key === 'em') {
        val ? this.markSelected(this.italicButton) : this.markUnselected(this.italicButton);
      }
    });
    this.click = {
      strong: false,
      em: false
    };
    this.marks = marks;
  };

  private markSelected = (el: HTMLDivElement) => {
    el.style.backgroundColor = '#000000';
    el.style.color = '#ffffff';
  };

  private markUnselected = (el: HTMLDivElement) => {
    el.style.backgroundColor = '#ffffff';
    el.style.color = '#000000';
  };
}
