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
import { FetchImageRequest, FetchImageResponse } from '../../../common/model/obj-request.model';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { FetchService } from '../../service/fetch.service';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ResponseType } from '../../../common/model/api.model';
import { UrlFactory } from '../../../common/factory/url.factory';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ContentFetchImageCommand implements ICommand<Promise<void>> {
  constructor(private req: FetchImageRequest) {}
  async execute(): Promise<void> {
    try {
      const blob = await FetchService.get<Blob>(this.req.url, ResponseType.BLOB);
      const data = await UrlFactory.toDataUri(blob.res);
      // fnConsoleLog('ContentFetchCssCommand->execute', this.req.url, css);
      await BrowserApi.sendTabMessage<FetchImageResponse>({
        type: BusMessageType.CONTENT_FETCH_IMAGE,
        data: {
          url: this.req.url,
          data,
          error: false
        }
      });
    } catch (e: unknown) {
      fnConsoleLog('ERROR !!!', e);
      await BrowserApi.sendTabMessage<FetchImageResponse>({
        type: BusMessageType.CONTENT_FETCH_IMAGE,
        data: {
          url: this.req.url,
          data: '',
          error: true
        }
      });
    }
  }
}
