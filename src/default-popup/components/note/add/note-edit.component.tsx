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
import { COLOR_DEFAULT_BORDER, DEFAULT_BORDER_RADIUS } from '../../../../common/components/colors';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { EditorView } from 'prosemirror-view';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageNoteDto } from '../../../../common/model/obj/obj-note.dto';
import { PageNoteUpdateCommand } from '../../../../common/command/page-note/page-note-update.command';
import { StyledInput } from '../../../../common/components/react/styled.input';
import { createTextEditorState } from '../../../../common/components/text-editor/text.editor.state';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';

interface Props {
  editNote: ObjDto<ObjPageNoteDto>;
  addCallback: () => void;
  cancelCallback: () => void;
}

class LocalModel {
  static editorView?: EditorView;

  static get description(): string {
    if (this.editorView) {
      return defaultMarkdownSerializer.serialize(this.editorView?.state.doc);
    }
    return '';
  }
}

export const NoteEditComponent: FunctionComponent<Props> = (props) => {
  const [title, setTitle] = useState<string>(props.editNote.data.data.title);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      create(ref.current);
    }
    return () => {
      LocalModel.editorView?.destroy();
    };
  }, []);

  const create = (el: HTMLDivElement): void => {
    let state = createTextEditorState(props.editNote.data.data.description);
    LocalModel.editorView = new EditorView(el, {
      state,
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        event.stopImmediatePropagation();
      },
      dispatchTransaction: (tx) => {
        state = state.apply(tx);
        LocalModel.editorView?.updateState(state);
      }
    });
  };

  const handleUpdate = async () => {
    await new PageNoteUpdateCommand(props.editNote, title, LocalModel.description).execute();
    props.addCallback();
  };

  return (
    <div style={{ marginTop: 5 }}>
      <h2>Edit Note</h2>
      <div
        style={{
          marginTop: 5,
          marginBottom: 10,
          borderRadius: DEFAULT_BORDER_RADIUS,
          maxHeight: '260px',
          minHeight: '260px',
          overflow: 'auto'
        }}
      >
        <div ref={ref}></div>
      </div>
      <div
        style={{
          border: COLOR_DEFAULT_BORDER,
          borderRadius: DEFAULT_BORDER_RADIUS,
          minWidth: 170,
          padding: '0px 5px 0px 5px'
        }}
      >
        <StyledInput value={title} placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <Button variant="outlined" onClick={props.cancelCallback}>
          Cancel
        </Button>
        <Button variant="outlined" onClick={handleUpdate}>
          Update
        </Button>
      </div>
    </div>
  );
};
