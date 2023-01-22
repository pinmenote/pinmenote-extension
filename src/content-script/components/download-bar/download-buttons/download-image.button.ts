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
import { BusDownloadMessage, BusMessageType } from '../../../../common/model/bus.model';
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { ContentSettingsStore } from '../../../store/content-settings.store';
import { ImageResizeFactory } from '../../../../common/factory/image-resize.factory';
import { PinComponent } from '../../pin.component';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnB64toBlob } from '../../../../common/fn/b64.to.blob.fn';
import { fnUid } from '../../../../common/fn/uid.fn';

const elStyles = {
  'margin-right': '10px',
  'user-select': 'none',
  cursor: 'pointer'
};

export class DownloadImageButton {
  private readonly el = document.createElement('div');

  constructor(private parent: PinComponent) {}

  render(): HTMLElement {
    this.el.innerText = 'visible area';
    this.el.setAttribute('title', 'only area visible on screen');
    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, elStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = async () => {
    const border = this.parent.ref.style.border;
    const radius = this.parent.ref.style.borderRadius;
    TinyEventDispatcher.addListener<string>(BusMessageType.CONTENT_TAKE_SCREENSHOT, async (event, key, value) => {
      TinyEventDispatcher.removeListener(BusMessageType.CONTENT_TAKE_SCREENSHOT, key);
      const screenshot = await ImageResizeFactory.resize(this.parent.ref.getBoundingClientRect(), value);
      let url = '';
      let filename = '';
      if (ContentSettingsStore.screenshotFormat == 'jpeg') {
        url = window.URL.createObjectURL(fnB64toBlob(screenshot, 'image/jpeg'));
        filename = `${fnUid()}.jpg`;
      } else {
        url = window.URL.createObjectURL(fnB64toBlob(screenshot, 'image/png'));
        filename = `${fnUid()}.png`;
      }
      const data = { url, filename };
      await BrowserApi.sendRuntimeMessage<BusDownloadMessage>({ type: BusMessageType.CONTENT_DOWNLOAD_DATA, data });
      this.parent.ref.style.border = border;
      this.parent.ref.style.borderRadius = radius;
    });
    this.parent.ref.style.border = this.parent.object.border.style;
    this.parent.ref.style.borderRadius = this.parent.object.border.radius;
    await BrowserApi.sendRuntimeMessage<void>({ type: BusMessageType.CONTENT_TAKE_SCREENSHOT });
  };
}
