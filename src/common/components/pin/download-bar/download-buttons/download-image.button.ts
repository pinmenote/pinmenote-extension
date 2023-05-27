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
import { BusDownloadMessage, BusMessageType } from '../../../../model/bus.model';
import { BrowserApi } from '../../../../service/browser.api.wrapper';
import { ObjRectangleDto } from '../../../../model/obj/obj-utils.dto';
import { PinEditManager } from '../../pin-edit.manager';
import { PinEditModel } from '../../model/pin-edit.model';
import { ScreenshotFactory } from '../../../../factory/screenshot.factory';
import { applyStylesToElement } from '../../../../style.utils';
import { fnB64toBlob } from '../../../../fn/fn-b64-to-blob';
import { fnUid } from '../../../../fn/fn-uid';

const elStyles = {
  'margin-right': '10px',
  'user-select': 'none',
  cursor: 'pointer'
};

export class DownloadImageButton {
  private readonly el: HTMLDivElement;

  constructor(private edit: PinEditManager, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    this.el.innerText = 'image';
    this.el.setAttribute('title', 'only area visible on screen');
    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, elStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = () => {
    // Switch to original border
    this.model.ref.style.border = this.model.border.style;
    this.model.ref.style.borderRadius = this.model.border.radius;

    this.edit.hideScreenshot();

    setTimeout(async () => {
      let rect: ObjRectangleDto = this.model.ref.getBoundingClientRect();
      if (this.model.canvas) {
        rect = this.model.canvas.rect;
      }
      const screenshot = await ScreenshotFactory.takeScreenshot(this.model.doc, rect);
      await this.downloadScreenshot(screenshot);

      this.edit.showScreenshot();

      this.model.ref.style.border = this.model.doc.settings.borderStyle;
      this.model.ref.style.borderRadius = this.model.doc.settings.borderRadius;
    }, 0);
  };

  private downloadScreenshot = async (screenshot: string): Promise<void> => {
    let url = '';
    let filename = '';
    if (this.model.doc.settings.screenshotFormat == 'jpeg') {
      url = window.URL.createObjectURL(fnB64toBlob(screenshot, 'image/jpeg'));
      filename = `${fnUid()}.jpg`;
    } else {
      url = window.URL.createObjectURL(fnB64toBlob(screenshot, 'image/png'));
      filename = `${fnUid()}.png`;
    }
    const data = { url, filename };
    await BrowserApi.sendRuntimeMessage<BusDownloadMessage>({ type: BusMessageType.CONTENT_DOWNLOAD_DATA, data });
  };
}
