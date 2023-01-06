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

export interface TimeoutMessage {
  ms: number;
  id: string;
}

export enum BusMessageType {
  // Internal content script
  CNT_SETTINGS = 'cnt.settings',
  CNT_EDITOR_MARKS = 'cnt.editor.marks',
  // Internal options tab
  OPT_PIN_SHOW_IMAGE = 'opt.pin.show.image',
  OPT_GET_LEFT_MENU_DATA = 'opt.get.left.menu.data',
  OPT_GET_SETTINGS_DATA = 'opt.get.settings.data',
  OPT_REFRESH_BOARD = 'opt.refresh.board',
  // Internal popup
  POP_CONSOLE_LOG = 'pop.console.log',
  POP_LOGIN_CLICK = 'pop.login.click',
  POP_ACCOUNT_CLICK = 'pop.account.click',
  POP_REGISTER_CLICK = 'pop.register.click',
  POP_PIN_REMOVE = 'pop.pin.remove',
  // Ack
  CONTENT_ACK = 'content.ack',
  WORKER_ACK = 'worker.ack',
  POPUP_ACK = 'popup.ack',
  // Popup
  POPUP_OPEN = 'popup.open',
  POPUP_INIT = 'popup.init',
  POPUP_PIN_START = 'popup.pin.start',
  POPUP_PIN_STOP = 'popup.pin.stop',
  POPUP_PIN_SHARE = 'popup.pin.share',
  POPUP_ACCESS_TOKEN = 'popup.access.token',
  POPUP_API_ERROR = 'popup.api.error',
  POPUP_LOGIN = 'popup.login',
  POPUP_LOGOUT = 'popup.logout',
  POPUP_REGISTER = 'popup.register',
  POPUP_SYNC_PINS = 'popup.sync.pins',
  POPUP_SYNC_QUOTA = 'popup.sync.quota',
  POPUP_PRIVATE_KEY_GET = 'popup.private.key.get',
  POPUP_PRIVATE_KEY_IMPORT = 'popup.private.key.import',
  // Content script
  CONTENT_LOGIN = 'content.login',
  CONTENT_LOGIN_REFRESH = 'content.login.refresh',
  CONTENT_PIN_VISIBLE = 'content.pin.visible',
  CONTENT_PIN_NAVIGATE = 'content.pin.navigate',
  CONTENT_PIN_REMOVE = 'content.pin.remove',
  CONTENT_PIN_SCREENSHOT = 'content.pin.screenshot',
  CONTENT_REFRESH_TOKEN = 'content.refresh.token',
  CONTENT_TIMEOUT = 'content.timeout',
  CONTENT_TIMEOUT_SET = 'content.timeout.set',
  CONTENT_THEME = 'content.theme',
  // Options
  OPTIONS_SYNCHRONIZE_DATA = 'options.synchronize.data',
  OPTIONS_SYNCHRONIZE_CLEAR = 'options.synchronize.clear',
  OPTIONS_PIN_GET_RANGE = 'options.pin.get.range',
  OPTIONS_PIN_SHARE = 'options.pin.share',
  OPTIONS_PIN_SEARCH = 'options.pin.search'
}
