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
import { BusMessageType } from '../../../../common/model/bus.model';
import { ContentSettingsStore } from '../../../store/content-settings.store';
import { CssFactory } from '../../../factory/css.factory';
import { HtmlComponent } from '../../../../common/model/html.model';
import { HtmlFactory } from '../../../factory/html.factory';
import { ImageResizeFactory } from '../../../../common/factory/image-resize.factory';
import { PinComponent } from '../../pin.component';
import { PinFactory } from '../../../factory/pin.factory';
import { PinObject } from '../../../../common/model/pin.model';
import { PinUpdateCommand } from '../../../../common/command/pin/pin-update.command';
import { TinyEventDispatcher } from '../../../../common/service/tiny.event.dispatcher';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnConsoleLog } from '../../../../common/fn/console.fn';
import { fnSleep } from '../../../../common/fn/sleep.fn';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class ParentIconComponent implements HtmlComponent {
  private el = document.createElement('div');
  constructor(private pin: PinObject, private parent: PinComponent) {}

  render(): HTMLElement {
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000" height="24" viewBox="0 0 24 24" width="24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
  </svg>`;

    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, iconButtonStyles);

    this.el.style.marginRight = '5px';

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = async (): Promise<void> => {
    if (this.parent.ref.parentElement?.tagName === 'BODY') {
      fnConsoleLog(`No parent for note ${this.pin.uid}`);
      return;
    }
    if (this.parent.ref.parentElement) {
      this.parent.setNewRef(this.parent.ref.parentElement);
      await fnSleep(100);
      this.parent.object.content.elementText = this.parent.ref.parentElement.innerText;

      const htmlContent = HtmlFactory.computeHtmlIntermediateData(this.parent.ref.parentElement);
      const css = CssFactory.computeCssContent(htmlContent.cssStyles);

      this.parent.object.content.html = htmlContent.html;
      this.parent.object.content.videoTime = htmlContent.videoTime;
      this.parent.object.content.css = css;
      this.parent.object.locator = PinFactory.computeLinkLocator(this.parent.ref.parentElement);

      return new Promise((resolve, reject) => {
        BrowserApi.sendRuntimeMessage<undefined>({
          type: BusMessageType.CONTENT_PIN_SCREENSHOT
        })
          .then(() => {
            // We handle it above, inside dispatcher
          })
          .catch((e) => {
            fnConsoleLog('PROBLEM contentSwapPin !!!', e);
            // pinData.container.style.display = 'inline-block';
            reject('PROBLEM !!!');
          });
        TinyEventDispatcher.addListener<string>(BusMessageType.CONTENT_PIN_SCREENSHOT, async (event, key, value) => {
          // After taking screenshot let's go back to note styles
          // pinData.container.style.display = 'inline-block';
          if (this.parent.ref.parentElement) {
            this.parent.ref.style.border = ContentSettingsStore.borderStyle;
            this.parent.ref.style.borderRadius = ContentSettingsStore.borderRadius;
          }

          TinyEventDispatcher.removeListener(event, key);

          this.parent.object.screenshot = await ImageResizeFactory.resize(this.parent.object.locator.rect, value);

          await new PinUpdateCommand(this.parent.object).execute();
          this.parent.resize();

          resolve();
        });
      });
    }
  };
}
