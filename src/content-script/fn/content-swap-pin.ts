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
import { fnComputeCssContent, fnComputeHtmlContent } from '../../common/fn/compute.element.fn';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { PinComponent } from '../components/pin.component';
import { PinUpdateCommand } from '../../common/command/pin/pin-update.command';
import { SettingsStore } from '../store/settings.store';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnImgResize } from '../../common/fn/img.resize.fn';
import { fnSleep } from '../../common/fn/sleep.fn';
import { fnXpath } from '../../common/fn/xpath.fn';

export const contentSwapPin = async (pinData: PinComponent, element: HTMLElement): Promise<void> => {
  pinData.container.style.display = 'none';
  pinData.restoreBorder();
  await fnSleep(100);
  pinData.setNewRef(element);
  pinData.object.locator.xpath = fnXpath(element);
  pinData.object.content.elementText = element.innerText;

  const htmlContent = fnComputeHtmlContent(element);
  const css = fnComputeCssContent(htmlContent.cssStyles);

  pinData.object.content.html = htmlContent.html;
  pinData.object.content.videoTime = htmlContent.videoTime;
  pinData.object.content.css = css;

  const rect = element.getBoundingClientRect();
  pinData.object.locator.elementSize = {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
  pinData.object.locator.offset = { x: 0, y: 0 };

  return new Promise((resolve, reject) => {
    BrowserApi.sendRuntimeMessage<undefined>({
      type: BusMessageType.CONTENT_PIN_SCREENSHOT
    })
      .then(() => {
        // We handle it above, inside dispatcher
      })
      .catch((e) => {
        fnConsoleLog('PROBLEM contentSwapPin !!!', e);
        pinData.container.style.display = 'inline-block';
        reject('PROBLEM !!!');
      });
    TinyEventDispatcher.addListener<string>(BusMessageType.CONTENT_PIN_SCREENSHOT, async (event, key, value) => {
      // After taking screenshot let's go back to note styles
      pinData.container.style.display = 'inline-block';
      element.style.border = SettingsStore.borderStyle;
      element.style.borderRadius = SettingsStore.borderRadius;

      TinyEventDispatcher.removeListener(event, key);

      pinData.object.screenshot = await fnImgResize(pinData.object, value);

      await new PinUpdateCommand({ pin: pinData.object }).execute();

      resolve();
    });
  });
};
