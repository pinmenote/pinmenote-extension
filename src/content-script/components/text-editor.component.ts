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
import { HtmlComponent, HtmlComponentFocusable } from '../../common/model/html.model';
import { BusMessageType } from '../../common/model/bus.model';
import { ContentSettingsStore } from '../store/content-settings.store';
import { EditorView } from 'prosemirror-view';
import { ObjUpdateHashtagsCommand } from '../../common/command/obj/hashtag/obj-update-hashtags.command';
import { PinObject } from '../../common/model/pin.model';
import { PinUpdateCommand } from '../../common/command/pin/pin-update.command';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { createTextEditorState } from '../../common/components/text-editor/text.editor.state';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { scrollToElementFn } from '../fn/scroll-to-element.fn';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class TextEditorComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el = document.createElement('div');

  private editorView?: EditorView;

  constructor(private pin: PinObject, private rect: PinRectangle) {}

  render(): HTMLElement {
    this.editorView = this.createEditor();
    this.el.style.border = ContentSettingsStore.borderStyle;
    this.resize(this.rect);
    return this.el;
  }

  cleanup(): void {
    this.editorView?.destroy();
  }

  resize(rect: PinRectangle): void {
    this.el.style.width = `${rect.width}px`;
  }

  focusin() {
    this.el.style.display = 'inline-block';
  }

  focusout() {
    this.el.style.display = 'none';
  }

  focus(goto = false): void {
    this.focusin();
    const height = parseInt(this.el.style.height.split('px')[0]);
    if (goto) scrollToElementFn(this.editorView?.dom, height);
    this.editorView?.focus();
  }

  private createEditor(): EditorView {
    let state = createTextEditorState(this.pin.value);
    return new EditorView(this.el, {
      state,
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        event.stopImmediatePropagation();
      },
      dispatchTransaction: async (tx) => {
        state = state.apply(tx);
        this.editorView?.updateState(state);
        const value = defaultMarkdownSerializer.serialize(state.doc);
        await new ObjUpdateHashtagsCommand(this.pin.id, this.pin.value, value).execute();
        this.pin.value = value;
        try {
          await new PinUpdateCommand(this.pin).execute();
        } catch (e) {
          fnConsoleLog('ERROR UPDATE PIN', e);
        }
        TinyEventDispatcher.dispatch(BusMessageType.CNT_EDITOR_MARKS, state);
      }
    });
  }
}
