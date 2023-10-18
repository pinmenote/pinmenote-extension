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
import { BrowserApi, BrowserGlobalSender, BusMessage } from '@pinmenote/browser-api';
import { BusMessageType } from '../common/model/bus.model';
import { ContentDownloadChromeCommand } from './command/content/content-download-chrome.command';
import { ContentDownloadFirefoxCommand } from './command/content/content-download-firefox.command';
import { ContentExtensionLoginCommand } from './command/content/content-extension-login.command';
import { ContentFetchCssCommand } from './command/content/content-fetch-css.command';
import { ContentFetchImageCommand } from './command/content/content-fetch-image.command';
import { ContentFetchPDFCommand } from './command/content/content-fetch-pdf.command';
import { ContentInvalidateCommand } from './command/content/content-invalidate.command';
import { ContentPinStopCommand } from './command/content/content-pin-stop.command';
import { ContentTakeScreenshotCommand } from './command/content/content-take-screenshot.command';
import { ContentThemeCommand } from './command/content/content-theme.command';
import { IframePassMessageCommand } from './command/iframe/iframe-pass-message.command';
import { PageComputeMessage } from '@pinmenote/page-compute';
import { PopupBugReportCommand } from './command/popup/popup-bug-report.command';
import { PopupLoginCommand } from './command/popup/popup-login.command';
import { PopupLoginSuccessCommand } from './command/popup/popup-login-success.command';
import { PopupLogoutCommand } from './command/popup/popup-logout.command';
import { PopupServerQuotaCommand } from './command/popup/popup-server-quota.command';
import { PopupVerify2faCommand } from './command/popup/popup-verify-2fa.command';
import { ScriptService } from './service/script.service';
import { SwInitSettingsCommand } from './command/sw/sw-init-settings.command';
import { SyncServerCommand } from './command/sync/sync-server.command';
import { TaskExecutor } from './task/task.executor';
import { fnConsoleLog } from '../common/fn/fn-console';
import { SyncManualOutgoingCommand } from './command/sync/manual/sync-manual-outgoing.command';
import { SyncServerIncomingCommand } from './command/sync/sync-server-incoming.command';
import { SyncGetProgressCommand } from './command/sync/progress/sync-get-progress.command';

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
    case BusMessageType.CONTENT_EXTENSION_LOGIN:
      await new ContentExtensionLoginCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_DOWNLOAD_DATA_CHROME:
      await new ContentDownloadChromeCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_DOWNLOAD_DATA_FIREFOX:
      await new ContentDownloadFirefoxCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_TAKE_SCREENSHOT:
      await new ContentTakeScreenshotCommand(msg.data, runtime.tab?.id).execute();
      break;
    case BusMessageType.CONTENT_THEME:
      await new ContentThemeCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_INVALIDATE:
      await new ContentInvalidateCommand(runtime.tab?.id).execute();
      break;
    case BusMessageType.CONTENT_STOP_LISTENERS:
      await new ContentPinStopCommand(runtime.tab?.id).execute();
      break;
    case PageComputeMessage.CONTENT_FETCH_CSS:
      await new ContentFetchCssCommand(msg.data, runtime.tab?.id).execute();
      break;
    case PageComputeMessage.CONTENT_FETCH_IMAGE:
      await new ContentFetchImageCommand(msg.data, runtime.tab?.id).execute();
      break;
    case BusMessageType.CONTENT_FETCH_PDF:
      await new ContentFetchPDFCommand(msg.data, runtime.tab?.id).execute();
      break;
    case BusMessageType.POPUP_BUG_REPORT:
      await new PopupBugReportCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_LOGIN:
      await new PopupLoginCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_LOGIN_SUCCESS:
      await new PopupLoginSuccessCommand().execute();
      break;
    case BusMessageType.POPUP_VERIFY_2FA:
      await new PopupVerify2faCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_LOGOUT:
      await new PopupLogoutCommand().execute();
      break;
    case BusMessageType.POPUP_SERVER_QUOTA:
      await new PopupServerQuotaCommand().execute();
      break;
    case BusMessageType.OPTIONS_SYNC_OUTGOING_OBJECT: {
      await new SyncManualOutgoingCommand(msg.data).execute();
      break;
    }
    case BusMessageType.OPTIONS_SYNC_INCOMING_CHANGES: {
      const progress = await new SyncGetProgressCommand().execute();
      await new SyncServerIncomingCommand(progress).execute();
      break;
    }
    case BusMessageType.IFRAME_INDEX:
    case BusMessageType.IFRAME_INDEX_REGISTER:
    case BusMessageType.IFRAME_START_LISTENERS:
    case BusMessageType.IFRAME_START_LISTENERS_RESULT:
    case BusMessageType.IFRAME_STOP_LISTENERS:
    case BusMessageType.IFRAME_MOUSE_OUT:
    case BusMessageType.IFRAME_PIN_SEND:
    case BusMessageType.IFRAME_PIN_SHOW:
    case PageComputeMessage.IFRAME_FETCH:
    case PageComputeMessage.IFRAME_FETCH_RESULT: {
      await new IframePassMessageCommand(msg, runtime.tab?.id).execute();
      break;
    }
  }
  // Sync command
  if (
    ![
      PageComputeMessage.CONTENT_FETCH_CSS,
      PageComputeMessage.CONTENT_FETCH_IMAGE,
      BusMessageType.OPTIONS_SYNC_OUTGOING_OBJECT,
      BusMessageType.OPTIONS_SYNC_INCOMING_CHANGES
    ].includes(msg.type as any)
  ) {
    await new SyncServerCommand().execute();
  }
  await TaskExecutor.dequeue();
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
