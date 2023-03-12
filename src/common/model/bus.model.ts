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
  OPT_PIN_SHOW_IMAGE = 'opt.pin.show.image',
  OPT_REFRESH_BOARD = 'opt.refresh.board',
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
  POPUP_BOOKMARK_ADD = 'popup.bookmark.add',
  POPUP_CAPTURE_ELEMENT_START = 'popup.capture.element.start',
  POPUP_CAPTURE_ELEMENT_STOP = 'popup.capture.element.stop',
  POPUP_INIT = 'popup.init',
  POPUP_LOGIN = 'popup.login',
  POPUP_LOGOUT = 'popup.logout',
  POPUP_OPEN = 'popup.open',
  POPUP_PAGE_SNAPSHOT_ADD = 'popup.page.snapshot.add',
  POPUP_PAGE_ELEMENT_SNAPSHOT_ADD = 'popup.page.element.snapshot.add',
  POPUP_PIN_START = 'popup.pin.start',
  POPUP_PIN_STOP = 'popup.pin.stop',
  POPUP_PIN_SHARE = 'popup.pin.share',
  POPUP_SYNC_PINS = 'popup.sync.pins',
  POPUP_TAKE_SCREENSHOT = 'popup.take.screenshot',
  // Content script
  CONTENT_DOWNLOAD_DATA = 'content.download',
  CONTENT_INVALIDATE = 'content.invalidate',
  CONTENT_FETCH_CSS = 'content.fetch.css',
  CONTENT_FETCH_IMAGE = 'content.fetch.image',
  CONTENT_PIN_VISIBLE = 'content.pin.visible',
  CONTENT_PIN_NAVIGATE = 'content.pin.navigate',
  CONTENT_PIN_REMOVE = 'content.pin.remove',
  CONTENT_PIN_STOP = 'content.pin.stop',
  CONTENT_TAKE_SCREENSHOT = 'content.take.screenshot',
  CONTENT_THEME = 'content.theme',
  // Options
  OPTIONS_SYNCHRONIZE_CLEAR = 'options.synchronize.clear',
  OPTIONS_SYNCHRONIZE_DATA = 'options.synchronize.data',
  OPTIONS_OBJ_SHARE = 'options.obj.share'
}
