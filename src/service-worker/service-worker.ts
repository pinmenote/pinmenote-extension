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
import { ContentLoginCommand } from './command/content/content-login.command';
import { ContentPinAddCommand } from './command/content/content-pin-add.command';
import { ContentPinFocusCommand } from './command/content/content-pin-focus.command';
import { ContentPinGetHrefCommand } from './command/content/content-pin-get-href.command';
import { ContentPinGetIdCommand } from './command/content/content-pin-get-id.command';
import { ContentPinNavigateCommand } from './command/content/content-pin-navigate.command';
import { ContentPinNextIdCommand } from './command/content/content-pin-next-id.command';
import { ContentPinRemoveCommand } from './command/content/content-pin-remove.command';
import { ContentPinScreenshotCommand } from './command/content/content-pin-screenshot.command';
import { ContentPinUpdateCommand } from './command/content/content-pin-update.command';
import { ContentRefreshTokenCommand } from './command/content/content-refresh-token.command';
import { ContentThemeCommand } from './command/content/content-theme.command';
import { ContentTimeoutCommand } from './command/content/content-timeout.command';
import { OptionsPinGetRangeCommand } from './command/options/options-pin-get-range.command';
import { OptionsPinSearchCommand } from './command/options/options-pin-search.command';
import { OptionsPinShareCommand } from './command/options/options-pin-share.command';
import { OptionsSynchronizeDataCommand } from './command/options/options-synchronize-data.command';
import { PopupAccessTokenCommand } from './command/popup/popup-access-token.command';
import { PopupBookmarkAddCommand } from './command/popup/popup-bookmark-add.command';
import { PopupBookmarkRemoveCommand } from './command/popup/popup-bookmark-remove.command';
import { PopupLoginCommand } from './command/popup/popup-login.command';
import { PopupLogoutCommand } from './command/popup/popup-logout.command';
import { PopupPinCleanupCommand } from './command/popup/popup-pin-cleanup.command';
import { PopupPinGetHrefCommand } from './command/popup/popup-pin-get-href.command';
import { PopupPinGetOriginCommand } from './command/popup/popup-pin-get-origin.command';
import { PopupPinRemoveCommand } from './command/popup/popup-pin-remove.command';
import { PopupPinShareCommand } from './command/popup/popup-pin-share.command';
import { PopupPinUpdateCommand } from './command/popup/popup-pin-update.command';
import { PopupPinVisibleCommand } from './command/popup/popup-pin-visible.command';
import { PopupPrivateKeyGetCommand } from './command/popup/popup-private-key-get.command';
import { PopupPrivateKeyImportCommand } from './command/popup/popup-private-key-import.command';
import { PopupRegisterCommand } from './command/popup/popup-register.command';
import { PopupSyncPinsCommand } from './command/popup/popup-sync-pins.command';
import { PopupSyncQuotaCommand } from './command/popup/popup-sync-quota.command';
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
    case BusMessageType.CONTENT_LOGIN:
      await new ContentLoginCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_PIN_FOCUS:
      await new ContentPinFocusCommand().execute();
      break;
    case BusMessageType.CONTENT_PIN_NAVIGATE:
      await new ContentPinNavigateCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_PIN_ID:
      await new ContentPinNextIdCommand().execute();
      break;
    case BusMessageType.CONTENT_PIN_ADD:
      await new ContentPinAddCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_PIN_UPDATE:
      await new ContentPinUpdateCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_PIN_REMOVE:
      await new ContentPinRemoveCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_PIN_GET_HREF:
      await new ContentPinGetHrefCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_PIN_GET_ID:
      await new ContentPinGetIdCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_PIN_SCREENSHOT:
      await new ContentPinScreenshotCommand().execute();
      break;
    case BusMessageType.CONTENT_REFRESH_TOKEN:
      await new ContentRefreshTokenCommand().execute();
      break;
    case BusMessageType.CONTENT_TIMEOUT:
      await new ContentTimeoutCommand(msg.data).execute();
      break;
    case BusMessageType.CONTENT_THEME:
      await new ContentThemeCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_BOOKMARK_ADD:
      await new PopupBookmarkAddCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_BOOKMARK_REMOVE:
      await new PopupBookmarkRemoveCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PIN_CLEANUP:
      await new PopupPinCleanupCommand().execute();
      break;
    case BusMessageType.POPUP_PIN_REMOVE:
      await new PopupPinRemoveCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PIN_SHARE:
      await new PopupPinShareCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PIN_UPDATE:
      await new PopupPinUpdateCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PIN_VISIBLE:
      await new PopupPinVisibleCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PIN_GET_ORIGIN:
      await new PopupPinGetOriginCommand(msg.data).execute();
      break;
    case BusMessageType.POPUP_PIN_GET_HREF:
      await new PopupPinGetHrefCommand(msg.data).execute();
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
    case BusMessageType.OPTIONS_PIN_GET_RANGE:
      await new OptionsPinGetRangeCommand(msg.data).execute();
      break;
    case BusMessageType.OPTIONS_PIN_SEARCH:
      await new OptionsPinSearchCommand(msg.data).execute();
      break;
    case BusMessageType.OPTIONS_PIN_SHARE:
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
  reloadActiveTabScript();
};

const reloadActiveTabScript = (): void => {
  try {
    /* eslint-disable @typescript-eslint/no-floating-promises */
    BrowserApi.tabs // eslint-disable-line @typescript-eslint/no-unsafe-call
      .query({ active: true, currentWindow: true }, async (tabs: chrome.tabs.Tab[]) => {
        const currentTab = tabs[0];
        if (!currentTab?.url) return;
        if (currentTab?.url.startsWith('chrome')) return;
        if (!currentTab?.id) return;
        await BrowserApi.reloadContentScript(currentTab.id);
      });
    /* eslint-enable @typescript-eslint/no-floating-promises */
  } catch (e) {
    fnConsoleLog('Error reloadActiveTabScript', e);
  }
};

const handleSuspend = () => {
  fnConsoleLog('handleSuspend->suspend');
};

const handleTabActivated = async (activeInfo: chrome.tabs.TabActiveInfo): Promise<void> => {
  fnConsoleLog('handleTabActivated', activeInfo.tabId);
  await BrowserApi.reloadContentScript(activeInfo.tabId);
};

BrowserApi.tabs.onActivated.addListener(handleTabActivated);

BrowserApi.runtime.onInstalled.addListener(handleInstalled);
BrowserApi.runtime.onMessage.addListener(handleMessage);
BrowserApi.runtime.onSuspend?.addListener(handleSuspend);

fnConsoleLog(`Pinmenote service-worker start! ${BrowserApi.runtime.id}`);
