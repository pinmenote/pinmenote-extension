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
import { ContentSettingsStore } from '../../store/content-settings.store';
import { EditorView } from 'prosemirror-view';
import { HtmlComponent } from '../../../common/model/html.model';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjRectangleDto } from '../../../common/model/obj/obj-utils.dto';
import { ObjUpdateHashtagsCommand } from '../../../common/command/obj/hashtag/obj-update-hashtags.command';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import { TextContainerComponent } from './text-container.component';
import { createTextEditorState } from '../../../common/components/text-editor/text.editor.state';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class TextEditorComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  private editorView?: EditorView;

  constructor(
    private obj: ObjDto<ObjPagePinDto>,
    private rect: ObjRectangleDto,
    private parent: TextContainerComponent
  ) {}

  get editor(): EditorView | undefined {
    return this.editorView;
  }

  render(): HTMLElement {
    this.editorView = this.createEditor();
    this.el.style.border = ContentSettingsStore.borderStyle;
    this.resize(this.rect);
    return this.el;
  }

  cleanup(): void {
    this.editorView?.destroy();
  }

  resize(rect: ObjRectangleDto): void {
    this.el.style.width = `${rect.width}px`;
  }

  focus(): void {
    this.editorView?.focus();
  }

  private createEditor(): EditorView {
    const pin = this.obj.data;
    let state = createTextEditorState(pin.value);
    return new EditorView(this.el, {
      state,
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        event.stopImmediatePropagation();
      },
      dispatchTransaction: async (tx) => {
        state = state.apply(tx);
        this.editorView?.updateState(state);
        const value = defaultMarkdownSerializer.serialize(state.doc);
        await new ObjUpdateHashtagsCommand(this.obj.id, pin.value, value).execute();
        pin.value = value;
        try {
          await new PinUpdateCommand(this.obj).execute();
        } catch (e) {
          fnConsoleLog('ERROR UPDATE PIN', e);
        }
      }
    });
  }
}
