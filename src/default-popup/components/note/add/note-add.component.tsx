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
import { ObjNoteDataDto } from '../../../../common/model/obj/obj-note.dto';
import { PageNoteAddCommand } from '../../../../common/command/page-note/page-note-add.command';
import { PopupActiveTabStore } from '../../../store/popup-active-tab.store';
import { StyledInput } from '../../../../common/components/react/styled.input';
import { WordFactory } from '../../../../common/text/word.factory';
import { createTextEditorState } from '../../../../common/components/text-editor/text.editor.state';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { fnSha256Object } from '../../../../common/fn/fn-hash';

interface Props {
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

export const NoteAddComponent: FunctionComponent<Props> = (props) => {
  const [title, setTitle] = useState<string>('');
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
    let state = createTextEditorState('');
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

  const handleAdd = async () => {
    const url = PopupActiveTabStore.url;
    if (!url) return;
    const description = LocalModel.description;
    const words = new Set<string>([...WordFactory.toWordList(title), ...WordFactory.toWordList(description)]);
    const dt = Date.now();
    const data: ObjNoteDataDto = {
      title,
      description,
      words: Array.from(words)
    };
    const hash = fnSha256Object({ ...data, url, dt });
    await new PageNoteAddCommand(
      {
        hash,
        url,
        data
      },
      dt
    ).execute();
    props.addCallback();
  };

  return (
    <div style={{ marginTop: 5 }}>
      <h2>Add Note</h2>
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
        <Button variant="outlined" onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
};
