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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjIframeContentDto } from '../../../common/model/obj/obj-iframe.dto';
import { PingStore } from '../../ping.store';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ContentFetchIframeCommand implements ICommand<Promise<void>> {
  private pingTimeout = -1;

  constructor(private data: { url: string }) {}

  async execute(): Promise<void> {
    fnConsoleLog('ContentFetchIframeCommand->execute', this.data);
    PingStore.register(this.data.url, this.pingSuccess);

    this.pingTimeout = setTimeout(this.pingFailure, 1000);
    await BrowserApi.sendTabMessage<{ url: string }>({ type: BusMessageType.CONTENT_PING_URL, data: this.data });
  }

  pingSuccess = async () => {
    fnConsoleLog('ContentFetchIframeCommand->pingSuccess');
    clearTimeout(this.pingTimeout);

    PingStore.remove(this.data.url);

    await BrowserApi.sendTabMessage<{ url: string }>({ type: BusMessageType.CONTENT_FETCH_IFRAME, data: this.data });
  };

  pingFailure = async () => {
    fnConsoleLog('ContentFetchIframeCommand->pingFailure');
    PingStore.remove(this.data.url);

    await BrowserApi.sendTabMessage<ObjIframeContentDto>({
      type: BusMessageType.CONTENT_FETCH_IFRAME_RESULT,
      data: {
        ok: false,
        url: this.data.url,
        html: '',
        css: { css: '', href: [] }
      }
    });
  };
}
