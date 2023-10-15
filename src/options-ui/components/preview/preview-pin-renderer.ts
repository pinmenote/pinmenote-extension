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
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { PinComponent } from '../../../common/components/pin/pin.component';
import { SettingsStore } from '../../store/settings.store';
import { XpathFactory } from '@pinmenote/page-compute';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class PreviewPinRenderer {
  static renderPins = async (ref: HTMLDivElement, ids: number[], addCallback: (pin: PinComponent) => void) => {
    if (!ref.lastElementChild) return;

    const el = ref.lastElementChild as HTMLIFrameElement;
    if (!el.contentDocument || !el.contentWindow) return;
    fnConsoleLog('HtmlPreviewComponent->renderPins', ids);

    for (const id of ids) {
      const pin = await new ObjGetCommand<ObjPinDto>(id).execute();
      fnConsoleLog('HtmlPreviewComponent->renderPins->pin', pin);
      if (pin.data.data.iframe) {
        this.renderIframePin(el, pin, addCallback);
      } else {
        this.renderHtmlPin(el, pin, addCallback);
      }
    }
  };

  static renderIframePin = (
    el: HTMLIFrameElement,
    pin: ObjDto<ObjPinDto>,
    addCallback: (pin: PinComponent) => void
  ) => {
    if (!el.contentDocument || !el.contentWindow) return false;
    if (!pin.data.data.iframe) return;
    const index = pin.data.data.iframe.index;
    const iframe = el.contentDocument.querySelector(`[data-pin-iframe-index="${index}"]`);
    if (!iframe) {
      const iframeList = Array.from(el.contentDocument.getElementsByTagName('iframe'));
      for (const frame of iframeList) {
        this.renderIframePin(frame, pin, addCallback);
      }
    } else {
      // fnConsoleLog('renderIframePin->pin', pin, 'index', index);
      this.renderHtmlPin(iframe as HTMLIFrameElement, pin, addCallback);
    }
  };

  static renderHtmlPin = (el: HTMLIFrameElement, pin: ObjDto<ObjPinDto>, addCallback: (pin: PinComponent) => void) => {
    if (!el.contentDocument || !el.contentWindow) return false;
    if (!SettingsStore.settings) return false;

    let xpath = pin.data.data.xpath;
    // canvas pins are saved as img
    if (pin.data.data.canvas) {
      xpath = xpath.replaceAll('CANVAS', 'IMG').replaceAll('VIDEO', 'IMG');
    }
    const value = XpathFactory.newXPathResult(el.contentDocument, xpath);
    const node = value.singleNodeValue as HTMLElement;

    if (!node) {
      fnConsoleLog('renderHtmlPin->not-found', pin, 'xpath', pin.data.data.xpath, 'el', el);
      return false;
    }

    const pinComponent = new PinComponent(node, pin, {
      settings: SettingsStore.settings,
      document: el.contentDocument,
      window: el.contentWindow
    });
    pinComponent.render();
    addCallback(pinComponent);
    fnConsoleLog('PIN !!!', pin.id, pin.data, value);
    return true;
  };
}
