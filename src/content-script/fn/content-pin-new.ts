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
import { HtmlContent, ObjectTypeDto } from '../../common/model/html.model';
import { PinObject, PinViewType } from '../../common/model/pin.model';
import {
  fnComputeCssContent,
  fnComputeHtmlContent,
  fnComputeHtmlParentStyles
} from '../../common/fn/compute.element.fn';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { ObjNextIdCommand } from '../../common/command/obj/obj-next-id.command';
import { PinAddCommand } from '../../common/command/pin/pin-add.command';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { XpathFactory } from '../../common/factory/xpath.factory';
import { contentPinNewUrl } from '../../common/fn/pin/content-pin-new-url';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnImgResize } from '../../common/fn/img.resize.fn';
import { fnUid } from '../../common/fn/uid.fn';
import LinkLocator = Pinmenote.Pin.LinkLocator;

export const contentPinNew = async (ref: HTMLElement): Promise<PinObject> => {
  // Roll back border to take snapshot
  const uid = fnUid();
  const locator: LinkLocator = computeLinkLocator(ref);
  const content: HtmlContent = computePinContent(ref);
  const dt = new Date().toISOString();
  const id = await new ObjNextIdCommand().execute();
  const dto: PinObject = {
    id,
    uid,
    type: ObjectTypeDto.Pin,
    version: 1,
    visible: true,
    createdAt: dt,
    updatedAt: dt,
    viewType: PinViewType.SCREENSHOT,
    url: contentPinNewUrl(),
    locator,
    content,
    value: '',
    size: {
      width: 163,
      height: 34
    },
    border: {
      radius: ref.style.borderRadius,
      style: ref.style.border
    }
  };
  return new Promise((resolve, reject) => {
    // Crop screenshot function
    TinyEventDispatcher.addListener<string>(
      BusMessageType.CONTENT_PIN_SCREENSHOT,
      async (event: string, key: string, value: string) => {
        TinyEventDispatcher.removeListener(event, key);
        await addNewPinWithScreenshot(dto, value, resolve);
      }
    );
    sendGetPinTakeScreenshot(reject);
  });
};

export const computeLinkLocator = (ref: HTMLElement): LinkLocator => {
  const rect = ref.getBoundingClientRect();
  const xpath = XpathFactory.newXPathString(ref);
  return {
    xpath,
    elementSize: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    }
  };
};

const computePinContent = (ref: HTMLElement): HtmlContent => {
  const bodyStyle = document.body.getAttribute('style') || undefined;
  const title = document.title;
  const htmlContent = fnComputeHtmlContent(ref);
  const htmlParentData = fnComputeHtmlParentStyles(ref);
  // fnConsoleLog('HTML :', htmlContent);
  let parent = ref.parentElement;
  // MAYBE WILL HELP - COMPUTE PARENT STYLES UP TO BODY
  // fnConsoleLog('1: ', htmlContent.cssStyles, parent);
  while (parent && parent.tagName.toLowerCase() !== 'html') {
    const attr = parent.getAttributeNode('class');
    if (attr) {
      const a = attr.value.split(' ').filter((e) => !!e);
      htmlContent.cssStyles.push(...a.map((e) => `.${e}`));
    }
    // fnConsoleLog('ADD : ', parent.tagName);
    htmlContent.cssStyles.push(parent.tagName);
    parent = parent.parentElement;
  }
  // fnConsoleLog('2:', htmlContent.cssStyles, parent);
  fnConsoleLog('START COMPUTE CSS !!!');
  const css = fnComputeCssContent(htmlContent.cssStyles);
  fnConsoleLog('STOP COMPUTE CSS !!!');
  const elementText = ref.innerText;
  const isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;
  return {
    theme: isLightTheme ? 'light' : 'dark',
    bodyStyle,
    title,
    html: htmlContent.html,
    videoTime: htmlContent.videoTime,
    css,
    elementText
  };
};

const sendGetPinTakeScreenshot = (reject: (value: string) => void) => {
  BrowserApi.sendRuntimeMessage<undefined>({
    type: BusMessageType.CONTENT_PIN_SCREENSHOT
  })
    .then(() => {
      // We handle it above, inside dispatcher
    })
    .catch((e) => {
      fnConsoleLog('PROBLEM sendGetPinTakeScreenshot !!!', e);
      reject('PROBLEM !!!');
    });
};

const addNewPinWithScreenshot = async (
  dto: PinObject,
  screenshot: string,
  resolve: (value: PinObject) => void
): Promise<void> => {
  // Let's resize screenshot and resolve promise
  try {
    screenshot = await fnImgResize(dto, screenshot);
  } finally {
    dto.screenshot = screenshot;
  }
  await new PinAddCommand(dto).execute();
  resolve(dto);
};
