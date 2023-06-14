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
export interface BusDownloadMessage {
  url: string;
  filename: string;
}

export enum BusMessageType {
  // Internal content script
  CNT_SETTINGS = 'cnt.settings',
  // Internal popup
  POP_CONSOLE_LOG = 'pop.console.log',
  POP_IS_ADDING = 'pop.is.adding',
  POP_UPDATE_URL = 'pop.update.url',
  // Ack
  CONTENT_ACK = 'content.ack',
  POPUP_ACK = 'popup.ack',
  WORKER_ACK = 'worker.ack',
  // Popup
  POPUP_API_ERROR = 'popup.api.error',
  POPUP_CAPTURE_ELEMENT_START = 'popup.capture.element.start',
  POPUP_INIT = 'popup.init',
  POPUP_LOGIN = 'popup.login',
  POPUP_VERIFY_2FA = 'popup.verify.2fa',
  POPUP_LOGIN_SUCCESS = 'popup.login.success',
  POPUP_LOGOUT = 'popup.logout',
  POPUP_OPEN = 'popup.open',
  POPUP_PAGE_SNAPSHOT_ADD = 'popup.page.snapshot.add',
  POPUP_PAGE_ELEMENT_SNAPSHOT_ADD = 'popup.page.element.snapshot.add',
  POPUP_PIN_START = 'popup.pin.start',
  POPUP_PAGE_ALTER_START = 'popup.page.alter.start',
  POPUP_TAKE_SCREENSHOT = 'popup.take.screenshot',
  // Content script
  CONTENT_DOWNLOAD_DATA = 'content.download',
  CONTENT_INVALIDATE = 'content.invalidate',
  CONTENT_FETCH_CSS = 'content.fetch.css',
  CONTENT_FETCH_IMAGE = 'content.fetch.image',
  CONTENT_PING_URL = 'content.ping.url',
  CONTENT_PIN_VISIBLE = 'content.pin.visible',
  CONTENT_PIN_NAVIGATE = 'content.pin.navigate',
  CONTENT_PIN_REMOVE = 'content.pin.remove',
  CONTENT_STOP_LISTENERS = 'content.stop.listeners',
  CONTENT_TAKE_SCREENSHOT = 'content.take.screenshot',
  CONTENT_THEME = 'content.theme',
  // Iframe content script
  IFRAME_INDEX = 'iframe.index',
  IFRAME_INDEX_REGISTER = 'iframe.index.register',
  IFRAME_START_LISTENERS = 'iframe.start.listeners',
  IFRAME_START_LISTENERS_RESULT = 'iframe.start.listeners.result',
  IFRAME_STOP_LISTENERS = 'iframe.stop.listeners',
  IFRAME_MOUSE_OUT = 'iframe.mouse.out',
  IFRAME_PIN_SEND = 'iframe.pin.send',
  IFRAME_PIN_SHOW = 'iframe.pin.show',
  IFRAME_PING = 'iframe.ping',
  IFRAME_PING_RESULT = 'iframe.ping.result',
  IFRAME_FETCH = 'iframe.fetch',
  IFRAME_FETCH_RESULT = 'iframe.fetch.result'
  // Options
}
