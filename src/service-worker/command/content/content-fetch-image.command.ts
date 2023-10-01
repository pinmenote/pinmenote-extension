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
import { FetchResponse, FetchService } from '@pinmenote/fetch-service';
import { BrowserApi } from '@pinmenote/browser-api';
import { FetchImageRequest } from '../../../common/model/obj-request.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { PageComputeMessage } from '@pinmenote/page-compute';
import { UrlFactory } from '../../../common/factory/url.factory';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class ContentFetchImageCommand implements ICommand<Promise<void>> {
  constructor(private req: FetchImageRequest, private tabId?: number) {}
  async execute(): Promise<void> {
    try {
      let headers = {};
      if (this.req.url.indexOf('openstreetmap.org') > -1) headers = { 'User-Agent': 'pinmenote' };
      fnConsoleLog('ContentFetchImageCommand->execute lol', this.req.url, headers);
      const req = await FetchService.fetch<Blob>(this.req.url, {
        type: 'BLOB',
        headers
      });
      const data = await UrlFactory.toDataUri(req.data);
      let ok = req.ok;
      if (
        data.startsWith('data:text/html') ||
        data.startsWith('data:text/javascript') ||
        data.startsWith('data:text/css')
      ) {
        fnConsoleLog('ContentFetchImageCommand->problem', this.req.url);
        ok = false;
      }
      await BrowserApi.sendTabMessage<FetchResponse<string>>(
        {
          type: PageComputeMessage.CONTENT_FETCH_IMAGE,
          data: { data, ok, url: req.url, status: req.status, type: req.type }
        },
        this.tabId
      );
    } catch (e) {
      fnConsoleLog('ContentFetchImageCommand->ERROR', e, this.req.url);
      await BrowserApi.sendTabMessage<FetchResponse<string>>(
        {
          type: PageComputeMessage.CONTENT_FETCH_IMAGE,
          data: {
            url: this.req.url,
            ok: false,
            status: 500,
            type: 'BLOB',
            data: ''
          }
        },
        this.tabId
      );
    }
  }
}
