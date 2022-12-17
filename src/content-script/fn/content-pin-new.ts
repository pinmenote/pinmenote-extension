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
import { HtmlContent, ObjectTypeDto } from '@common/model/html.model';
import { PinObject, PinViewType } from '@common/model/pin.model';
import { fnComputeCssContent, fnComputeHtmlContent } from '@common/fn/compute.element.fn';
import { BusMessageType } from '@common/model/bus.model';
import { TinyEventDispatcher } from '@common/service/tiny.event.dispatcher';
import { contentPinNewUrl } from '@common/fn/pin/content-pin-new-url';
import { fnImgResize } from '@common/fn/img.resize.fn';
import { fnUid } from '@common/fn/uid.fn';
import { fnXpath } from '@common/fn/xpath.fn';
import { sendRuntimeMessage } from '@common/message/runtime.message';
import LinkLocator = Pinmenote.Pin.LinkLocator;
import PinPoint = Pinmenote.Pin.PinPoint;

export const contentPinNew = async (ref: HTMLElement, offset: PinPoint): Promise<PinObject> => {
  // Roll back border to take snapshot
  const uid = fnUid();
  const locator: LinkLocator = computeLinkLocator(ref, offset);
  const content: HtmlContent = computePinContent(ref);
  const dt = new Date().toISOString();
  const dto: PinObject = {
    id: -1,
    uid,
    type: ObjectTypeDto.Pin,
    version: 1,
    visible: true,
    createdDate: dt,
    updatedDate: dt,
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
    let id = -1;
    TinyEventDispatcher.addListener<string>(
      BusMessageType.CONTENT_PIN_SCREENSHOT,
      async (event: string, key: string, value: string) => {
        TinyEventDispatcher.removeListener(event, key);
        // add pin with screenshot
        dto.id = id;
        await addNewPinWithScreenshot(dto, value, resolve);
      }
    );
    TinyEventDispatcher.addListener<number>(BusMessageType.CONTENT_PIN_ID, (event, key, value) => {
      TinyEventDispatcher.removeListener(event, key);
      id = value;
      sendGetPinTakeScreenshot(reject);
    });
    sendGetPinNextId(reject);
  });
};

const computeLinkLocator = (ref: HTMLElement, offset: PinPoint): LinkLocator => {
  const rect = ref.getBoundingClientRect();
  const xpath = fnXpath(ref);
  return {
    xpath,
    offset,
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

  const css = fnComputeCssContent(htmlContent.cssStyles);
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

const sendGetPinNextId = (reject: (value: string) => void) => {
  sendRuntimeMessage<undefined>({
    type: BusMessageType.CONTENT_PIN_ID
  })
    .then(() => {
      // We handle it above, inside dispatcher
    })
    .catch(() => {
      reject('PROBLEM !!!');
    });
};

const sendGetPinTakeScreenshot = (reject: (value: string) => void) => {
  sendRuntimeMessage<undefined>({
    type: BusMessageType.CONTENT_PIN_SCREENSHOT
  })
    .then(() => {
      // We handle it above, inside dispatcher
    })
    .catch(() => {
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
  await sendRuntimeMessage<PinObject>({
    type: BusMessageType.CONTENT_PIN_ADD,
    data: dto
  });
  resolve(dto);
};
