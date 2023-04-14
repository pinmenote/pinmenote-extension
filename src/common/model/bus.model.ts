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
export type BrowserGlobalSender = browser.runtime.MessageSender | chrome.runtime.MessageSender;

export interface BusMessage<T> {
  type: BusMessageType;
  data?: T;
}

export interface BusDownloadMessage {
  url: string;
  filename: string;
}

export enum BusMessageType {
  // Internal content script
  CNT_SETTINGS = 'cnt.settings',
  // Internal options tab
  OPT_GET_LEFT_MENU_DATA = 'opt.get.left.menu.data',
  OPT_SHOW_HTML = 'opt.show.html',
  // Internal popup
  POP_CONSOLE_LOG = 'pop.console.log',
  POP_PIN_REMOVE = 'pop.pin.remove',
  POP_UPDATE_URL = 'pop.update.url',
  // Ack
  CONTENT_ACK = 'content.ack',
  POPUP_ACK = 'popup.ack',
  WORKER_ACK = 'worker.ack',
  // Popup
  POPUP_API_ERROR = 'popup.api.error',
  POPUP_CAPTURE_ELEMENT_START = 'popup.capture.element.start',
  POPUP_CAPTURE_ELEMENT_STOP = 'popup.capture.element.stop',
  POPUP_INIT = 'popup.init',
  POPUP_LOGIN = 'popup.login',
  POPUP_VERIFY_2FA = 'popup.verify.2fa',
  POPUP_LOGIN_SUCCESS = 'popup.login.success',
  POPUP_LOGOUT = 'popup.logout',
  POPUP_OPEN = 'popup.open',
  POPUP_PAGE_SNAPSHOT_ADD = 'popup.page.snapshot.add',
  POPUP_PAGE_ELEMENT_SNAPSHOT_ADD = 'popup.page.element.snapshot.add',
  POPUP_PIN_START = 'popup.pin.start',
  POPUP_PIN_STOP = 'popup.pin.stop',
  POPUP_SYNC_DATA = 'popup.sync.data',
  POPUP_SYNC_DATA_COMPLETE = 'popup.sync.data.complete',
  POPUP_SYNC_DATA_CLEAR = 'popup.sync.data.clear',
  POPUP_TAKE_SCREENSHOT = 'popup.take.screenshot',
  // Content script
  CONTENT_DOWNLOAD_DATA = 'content.download',
  CONTENT_INVALIDATE = 'content.invalidate',
  CONTENT_FETCH_CSS = 'content.fetch.css',
  CONTENT_FETCH_IMAGE = 'content.fetch.image',
  CONTENT_FETCH_IFRAME_RESULT = 'content.fetch.iframe.result',
  CONTENT_FETCH_IFRAME_PING = 'content.fetch.iframe.ping',
  CONTENT_PING_URL = 'content.ping.url',
  CONTENT_PIN_VISIBLE = 'content.pin.visible',
  CONTENT_PIN_NAVIGATE = 'content.pin.navigate',
  CONTENT_PIN_REMOVE = 'content.pin.remove',
  CONTENT_PIN_STOP = 'content.pin.stop',
  CONTENT_TAKE_SCREENSHOT = 'content.take.screenshot',
  CONTENT_THEME = 'content.theme'
  // Options
}
