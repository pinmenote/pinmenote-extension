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
import { defaultMarkdownParser, schema } from 'prosemirror-markdown';
import { EditorState } from 'prosemirror-state';
import { history as baseHistory } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import { buildInputRules } from './text.editor.input.rules';
import { buildKeymap } from './text.editor.keymap';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { keymap } from 'prosemirror-keymap';

export const createTextEditorState = (content: string) => {
  const doc: any = defaultMarkdownParser.parse(content);
  return EditorState.create({
    doc,
    plugins: [
      gapCursor(),
      dropCursor(),
      keymap(buildKeymap(schema)), // custom keys
      keymap(baseKeymap),
      buildInputRules(schema), // custom rules
      baseHistory()
    ]
  });
};
