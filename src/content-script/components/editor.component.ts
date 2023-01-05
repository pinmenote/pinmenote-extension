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
import { PIN_HASHTAG_REGEX, PinObject, PinUpdateObject } from '../../common/model/pin.model';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { EditorView } from 'prosemirror-view';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { createTextEditorState } from '../../common/components/text-editor/text.editor.state';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { scrollToElementFn } from '../fn/scroll-to-element.fn';

export class EditorComponent {
  private el = document.createElement('div');

  private editorView?: EditorView;

  constructor(private pin: PinObject) {}

  get editor(): EditorView | undefined {
    return this.editorView;
  }

  render(): HTMLElement {
    this.el.style.width = `${this.pin.size.width}px`;
    this.el.style.height = `${this.pin.size.height}px`;

    this.editorView = this.createEditor();
    // FIXME resize prosemirror element differently
    setTimeout(this.deferredResize, 0);

    this.el.addEventListener('mouseup', this.handleMouseUp);
    return this.el;
  }

  cleanup(): void {
    this.editorView?.destroy();
    this.el.removeEventListener('mouseup', this.handleMouseUp);
  }

  focus(goto = false): void {
    if (goto) scrollToElementFn(this.editorView?.dom, this.pin.size.height);
    this.editorView?.focus();
  }

  private deferredResize = async () => {
    const div: HTMLDivElement = this.el.getElementsByClassName('ProseMirror')[0] as HTMLDivElement;
    if (!div) return;
    await this.resizeTextArea();
  };

  private handleMouseUp = async () => {
    await this.resizeTextArea();
  };

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
        await this.resizeTextArea();
        const value = defaultMarkdownSerializer.serialize(state.doc);
        const oldMatch = this.pin.value.match(PIN_HASHTAG_REGEX);
        const newMatch = value.match(PIN_HASHTAG_REGEX);
        this.pin.value = value;
        try {
          await BrowserApi.sendRuntimeMessage<PinUpdateObject>({
            type: BusMessageType.CONTENT_PIN_UPDATE,
            data: {
              pin: this.pin,
              oldHashtag: oldMatch ? Array.from(oldMatch) : [],
              newHashtag: newMatch ? Array.from(newMatch) : []
            }
          });
        } catch (e) {
          fnConsoleLog('ERROR UPDATE PIN', e);
        }
        TinyEventDispatcher.dispatch(BusMessageType.CNT_EDITOR_MARKS, state);
      }
    });
  }

  private resizeTextArea = async () => {
    const div: HTMLDivElement = this.el.getElementsByClassName('ProseMirror')[0] as HTMLDivElement;
    if (div) {
      this.pin.size.width = Math.round(div.offsetWidth);
      this.pin.size.height = Math.round(div.offsetHeight);
      this.el.style.width = `${this.pin.size.width}px`;
      this.el.style.height = `${this.pin.size.height}px`;
    }
    try {
      await BrowserApi.sendRuntimeMessage<PinUpdateObject>({
        type: BusMessageType.CONTENT_PIN_UPDATE,
        data: { pin: this.pin }
      });
    } catch (e) {
      fnConsoleLog(e);
    }
  };
}
