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
import { BrowserGlobalSender, BusMessage, BusMessageType } from '../common/model/bus.model';
import { BrowserApi } from '../common/service/browser.api.wrapper';
import { ContentDownloadDataCommand } from './command/content/content-download-data.command';
import { ContentFetchCssCommand } from './command/content/content-fetch-css.command';
import { ContentFetchImageCommand } from './command/content/content-fetch-image.command';
import { ContentInvalidateCommand } from './command/content/content-invalidate.command';
import { ContentPinStopCommand } from './command/content/content-pin-stop.command';
import { ContentTakeScreenshotCommand } from './command/content/content-take-screenshot.command';
import { ContentThemeCommand } from './command/content/content-theme.command';
import { PopupLoginCommand } from './command/popup/popup-login.command';
import { PopupLogoutCommand } from './command/popup/popup-logout.command';
import { PopupSyncDataCommand } from './command/popup/popup-sync-data.command';
import { PopupTakeScreenshotCommand } from './command/popup/popup-take-screenshot.command';
import { PopupVerify2faCommand } from './command/popup/popup-verify-2fa.command';
import { ScriptService } from './service/script.service';
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
    case BusMessageType.POPUP_LOGIN:
      await new PopupLoginCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_VERIFY_2FA:
      await new PopupVerify2faCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_LOGOUT:
      await new PopupLogoutCommand().execute();
      break;
    case BusMessageType.POPUP_SYNC_DATA:
      await new PopupSyncDataCommand().execute();
      break;
    case BusMessageType.POPUP_TAKE_SCREENSHOT:
      await new PopupTakeScreenshotCommand().execute();
      break;
  }
};

const handleInstalled = async (event: unknown): Promise<void> => {
  fnConsoleLog('INSTALLED', event, BrowserApi.runtime.id);
  // Initial Content Settings
  await new SwInitSettingsCommand().execute();
  await ScriptService.reloadScripts();
};

const handleSuspend = () => {
  fnConsoleLog('handleSuspend->suspend');
};

const handleTabActivated = async (activeInfo: { tabId: number; windowId: number }) => {
  fnConsoleLog('handleTabActivated->activeInfo', activeInfo);
  try {
    await BrowserApi.tabs.sendMessage(activeInfo.tabId, { type: BusMessageType.CONTENT_INVALIDATE });
  } catch (e) {
    fnConsoleLog('handleTabActivated->error', e);
    await ScriptService.reloadScripts();
  }
};
BrowserApi.runtime.onInstalled.addListener(handleInstalled);
BrowserApi.runtime.onMessage.addListener(handleMessage);
BrowserApi.tabs.onActivated.addListener(handleTabActivated);
BrowserApi.runtime.onSuspend?.addListener(handleSuspend);

fnConsoleLog(`Pinmenote service-worker start! ${BrowserApi.runtime.id}`);
