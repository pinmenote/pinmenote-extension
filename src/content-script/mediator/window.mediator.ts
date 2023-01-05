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
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { PinStore } from '../store/pin.store';
import { RuntimeLoginRefreshCommand } from '../command/runtime/runtime-login-refresh.command';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class WindowMediator {
  private static readonly REFRESH_TOKEN_RESPONSE_EVENT = 'pinmenote.refresh.token.response';
  private static readonly REFRESH_TOKEN_EVENT = 'pinmenote.refresh.token';

  private static readonly LOGIN_EVENT = 'pinmenote.login';

  static start(): void {
    window.addEventListener(this.LOGIN_EVENT, this.handleContentLoginRefresh);
    window.addEventListener(this.REFRESH_TOKEN_EVENT, this.handleRefreshToken);
    window.addEventListener('resize', this.handleResize);

    TinyEventDispatcher.addListener<void>(BusMessageType.CONTENT_REFRESH_TOKEN, this.handleContentRefreshToken);
  }

  static cleanup(): void {
    window.removeEventListener(this.LOGIN_EVENT, this.handleContentLoginRefresh);
    window.removeEventListener(this.REFRESH_TOKEN_EVENT, this.handleRefreshToken);
    window.removeEventListener('resize', this.handleResize);
  }

  private static handleContentLoginRefresh = async () => {
    await new RuntimeLoginRefreshCommand().execute();
  };

  private static handleRefreshToken = async () => {
    fnConsoleLog('handleRefreshToken');
    await BrowserApi.sendRuntimeMessage<string>({
      type: BusMessageType.CONTENT_REFRESH_TOKEN,
      data: window.location.origin
    });
  };

  // Move to message manager
  private static handleContentRefreshToken = () => {
    fnConsoleLog('content-script->handleContentRefrehToken');
    window.dispatchEvent(new Event(this.REFRESH_TOKEN_RESPONSE_EVENT));
  };

  private static handleResize = (): void => {
    PinStore.each((pin) => {
      pin.resize();
    });
  };
}
