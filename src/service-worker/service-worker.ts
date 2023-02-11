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
import { BrowserGlobalSender, BusMessage, BusMessageType } from '../common/model/bus.model';
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { ContentDownloadDataCommand } from './command/content/content-download-data.command';
import { ContentFetchCssCommand } from './command/content/content-fetch-css.command';
import { ContentFetchImageCommand } from './command/content/content-fetch-image.command';
import { ContentInvalidateCommand } from './command/content/content-invalidate.command';
import { ContentPinStopCommand } from './command/content/content-pin-stop.command';
import { ContentRefreshTokenCommand } from './command/content/content-refresh-token.command';
import { ContentTakeScreenshotCommand } from './command/content/content-take-screenshot.command';
import { ContentThemeCommand } from './command/content/content-theme.command';
import { OptionsObjGetRangeCommand } from './command/options/options-obj-get-range.command';
import { OptionsObjSearchCommand } from './command/options/options-obj-search.command';
import { OptionsPinShareCommand } from './command/options/options-pin-share.command';
import { OptionsSynchronizeDataCommand } from './command/options/options-synchronize-data.command';
import { PopupAccessTokenCommand } from './command/popup/popup-access-token.command';
import { PopupLoginCommand } from './command/popup/popup-login.command';
import { PopupLogoutCommand } from './command/popup/popup-logout.command';
import { PopupPinShareCommand } from './command/popup/popup-pin-share.command';
import { PopupPrivateKeyGetCommand } from './command/popup/popup-private-key-get.command';
import { PopupPrivateKeyImportCommand } from './command/popup/popup-private-key-import.command';
import { PopupRegisterCommand } from './command/popup/popup-register.command';
import { PopupSyncPinsCommand } from './command/popup/popup-sync-pins.command';
import { PopupSyncQuotaCommand } from './command/popup/popup-sync-quota.command';
import { PopupTakeScreenshotCommand } from './command/popup/popup-take-screenshot.command';
import { SwInitSettingsCommand } from './command/sw/sw-init-settings.command';
import { fnConsoleLog } from '../common/fn/console.fn';

const handleMessage = async (
  msg: BusMessage<any>,
  runtime: BrowserGlobalSender,
  sendResponse: (response: any) => void
): Promise<void> => {
  sendResponse({
    type: BusMessageType.WORKER_ACK
  });

  // Skip not owned messages
  if (runtime.id !== BrowserApi.runtime.id) return;

  switch (msg.type) {
    case BusMessageType.CONTENT_DOWNLOAD_DATA:
      await new ContentDownloadDataCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_TAKE_SCREENSHOT:
      await new ContentTakeScreenshotCommand().execute();
      break;
    case BusMessageType.CONTENT_REFRESH_TOKEN:
      await new ContentRefreshTokenCommand().execute();
      break;
    case BusMessageType.CONTENT_THEME:
      await new ContentThemeCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_INVALIDATE:
      await new ContentInvalidateCommand().execute();
      break;
    case BusMessageType.CONTENT_PIN_STOP:
      await new ContentPinStopCommand().execute();
      break;
    case BusMessageType.CONTENT_FETCH_CSS:
      await new ContentFetchCssCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_FETCH_IMAGE:
      await new ContentFetchImageCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PIN_SHARE:
      await new PopupPinShareCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_ACCESS_TOKEN:
      await new PopupAccessTokenCommand().execute();
      break;
    case BusMessageType.POPUP_LOGIN:
      await new PopupLoginCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_LOGOUT:
      await new PopupLogoutCommand().execute();
      break;
    case BusMessageType.POPUP_SYNC_PINS:
      await new PopupSyncPinsCommand().execute();
      break;
    case BusMessageType.POPUP_SYNC_QUOTA:
      await new PopupSyncQuotaCommand().execute();
      break;
    case BusMessageType.POPUP_REGISTER:
      await new PopupRegisterCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PRIVATE_KEY_GET:
      await new PopupPrivateKeyGetCommand().execute();
      break;
    case BusMessageType.POPUP_PRIVATE_KEY_IMPORT:
      await new PopupPrivateKeyImportCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_TAKE_SCREENSHOT:
      await new PopupTakeScreenshotCommand().execute();
      break;
    case BusMessageType.OPTIONS_OBJ_GET_RANGE:
      await new OptionsObjGetRangeCommand(msg.data).execute();
      break;
    case BusMessageType.OPTIONS_OBJ_SEARCH:
      await new OptionsObjSearchCommand(msg.data).execute();
      break;
    case BusMessageType.OPTIONS_OBJ_SHARE:
      await new OptionsPinShareCommand(msg.data).execute();
      break;
    case BusMessageType.OPTIONS_SYNCHRONIZE_DATA:
      await new OptionsSynchronizeDataCommand().execute();
      break;
  }
};

const handleInstalled = async (event: unknown): Promise<void> => {
  fnConsoleLog('INSTALLED', event, BrowserApi.runtime.id);
  // Initial Content Settings
  await new SwInitSettingsCommand().execute();
};

const handleSuspend = () => {
  fnConsoleLog('handleSuspend->suspend');
};

BrowserApi.runtime.onInstalled.addListener(handleInstalled);
BrowserApi.runtime.onMessage.addListener(handleMessage);
BrowserApi.runtime.onSuspend?.addListener(handleSuspend);

fnConsoleLog(`Pinmenote service-worker start! ${BrowserApi.runtime.id}`);
