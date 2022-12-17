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
  // Internal options tab
  OPT_PIN_EDIT = 'opt.pin.edit',
  OPT_PIN_CANCEL_EDIT = 'opt.pin.cancel.edit',
  OPT_PIN_SAVE_EDIT = 'opt.pin.save.edit',
  OPT_PIN_SHOW_IMAGE = 'opt.pin.show.image',
  // Internal popup
  POP_CONSOLE_LOG = 'pop.console.log',
  POP_LOGIN_CLICK = 'pop.login.click',
  POP_ACCOUNT_CLICK = 'pop.account.click',
  POP_REGISTER_CLICK = 'pop.register.click',
  // Ack
  CONTENT_ACK = 'content.ack',
  WORKER_ACK = 'worker.ack',
  POPUP_ACK = 'popup.ack',
  // Popup
  POPUP_OPEN = 'popup.open',
  POPUP_INIT = 'popup.init',
  POPUP_PIN_START = 'popup.pin.start',
  POPUP_PIN_STOP = 'popup.pin.stop',
  POPUP_PIN_GET_HREF = 'popup.pin.get.href',
  POPUP_PIN_GET_ORIGIN = 'popup.pin.get.origin',
  POPUP_PIN_CLEANUP = 'popup.pin.cleanup',
  POPUP_PIN_REMOVE = 'popup.pin.remove',
  POPUP_PIN_SHARE = 'popup.pin.share',
  POPUP_PIN_UPDATE = 'popup.pin.update',
  POPUP_PIN_VISIBLE = 'popup.pin.visible',
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
  CONTENT_PIN_FOCUS = 'content.pin.focus',
  CONTENT_PIN_CHANGED = 'content.pin.changed',
  CONTENT_PIN_NAVIGATE = 'content.pin.navigate',
  CONTENT_PIN_ID = 'content.pin.id',
  CONTENT_PIN_ADD = 'content.pin.add',
  CONTENT_LINK_ADD = 'content.link.add',
  CONTENT_PIN_UPDATE = 'content.pin.update',
  CONTENT_PIN_REMOVE = 'content.pin.remove',
  CONTENT_PIN_GET_HREF = 'content.pin.get.href',
  CONTENT_PIN_GET_ID = 'content.pin.get.id',
  CONTENT_PIN_SCREENSHOT = 'content.pin.screenshot',
  CONTENT_REFRESH_TOKEN = 'content.refresh.token',
  CONTENT_TIMEOUT = 'content.timeout',
  CONTENT_TIMEOUT_SET = 'content.timeout.set',
  CONTENT_SETTINGS = 'content.settings',
  // Options
  OPTIONS_SYNCHRONIZE_DATA = 'options.synchronize.data',
  OPTIONS_GET_SETTINGS = 'options.get.settings',
  OPTIONS_SET_SETTINGS = 'options.set.settings',
  OPTIONS_PIN_GET_HASH_LIST = 'options.pin.get.hash.list',
  OPTIONS_PIN_GET_RANGE = 'options.pin.get.range',
  OPTIONS_PIN_GET_LAST_ID = 'options.pin.get.last.id',
  OPTIONS_PIN_REMOVE = 'options.pin.remove',
  OPTIONS_PIN_SHARE = 'options.pin.share',
  OPTIONS_PIN_UPDATE = 'options.pin.update',
  OPTIONS_PIN_SEARCH = 'options.pin.search',
  OPTIONS_GET_ORIGIN_URLS = 'options.get.origin.urls'
}
