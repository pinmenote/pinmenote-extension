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
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../../common/model/bus.model';
import { ContentSettingsStore } from '../../../store/content-settings.store';
import { HtmlComponent } from '../../../model/html.model';
import { HtmlFactory } from '../../../factory/html/html.factory';
import { ImageResizeFactory } from '../../../../common/factory/image-resize.factory';
import { ObjSnapshotContentDto } from '../../../../common/model/obj/obj-content.dto';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { PinModel } from '../../pin.model';
import { PinUpdateCommand } from '../../../../common/command/pin/pin-update.command';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import { XpathFactory } from '../../../../common/factory/xpath.factory';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { fnSleep } from '../../../../common/fn/fn-sleep';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class EditBarParentButton implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');

  constructor(private model: PinModel, private resizeCallback: () => void) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24">
    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
  </svg>`;
    this.el.setAttribute('title', 'Expand to parent');

    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, iconButtonStyles);

    this.el.style.marginRight = '5px';

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = async (): Promise<void> => {
    if (this.model.ref.parentElement?.tagName === 'BODY') {
      fnConsoleLog(`No parent for node ${this.model.id}`);
      return;
    }
    if (this.model.ref.parentElement) {
      this.model.ref = this.model.ref.parentElement;
      await fnSleep(100);

      const htmlContent = await HtmlFactory.computeHtmlIntermediateData({
        ref: this.model.ref,
        depth: 1,
        skipElements: [],
        skipTagCache: new Set<string>(),
        skipUrlCache: new Set<string>(),
        isPartial: true,
        insideLink: this.model.ref.tagName.toLowerCase() === 'a'
      });
      const html = HtmlFactory.computeHtmlParent(this.model.ref.parentElement, htmlContent.html, true);

      // snapshot content
      const key = `${ObjectStoreKeys.CONTENT_ID}:${this.model.object.data.snapshot.contentId}`;
      const snapshot = await BrowserStorageWrapper.get<ObjSnapshotContentDto>(key);
      snapshot.html = html;
      snapshot.content = htmlContent.content;
      await BrowserStorageWrapper.set(key, snapshot);

      this.model.object.data.xpath = XpathFactory.newXPathString(this.model.ref);
      const rect = XpathFactory.computeRect(this.model.ref);

      return new Promise((resolve, reject) => {
        BrowserApi.sendRuntimeMessage<undefined>({
          type: BusMessageType.CONTENT_TAKE_SCREENSHOT
        })
          .then(() => {
            // We handle it above, inside dispatcher
          })
          .catch((e) => {
            fnConsoleLog('PROBLEM contentSwapPin !!!', e);
            // pinData.container.style.display = 'inline-block';
            reject('PROBLEM !!!');
          });
        TinyEventDispatcher.addListener<string>(BusMessageType.CONTENT_TAKE_SCREENSHOT, async (event, key, value) => {
          TinyEventDispatcher.removeListener(event, key);

          // After taking screenshot let's go back to note styles
          // pinData.container.style.display = 'inline-block';
          if (this.model.ref) {
            this.model.ref.style.border = ContentSettingsStore.borderStyle;
            this.model.ref.style.borderRadius = ContentSettingsStore.borderRadius;
          }

          this.model.object.data.snapshot.screenshot = await ImageResizeFactory.resize(rect, value);

          await new PinUpdateCommand(this.model.object).execute();
          this.resizeCallback();

          resolve();
        });
      });
    }
  };
}
