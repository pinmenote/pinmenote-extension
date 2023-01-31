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
import { FetchCssRequest, FetchCssResponse } from '../../../common/model/obj-request.model';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { FetchService } from '../../service/fetch.service';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class ContentFetchCssCommand implements ICommand<Promise<void>> {
  constructor(private req: FetchCssRequest) {}
  async execute(): Promise<void> {
    const css = await FetchService.get<string>(this.req.url, {}, false);
    fnConsoleLog('ContentFetchCssCommand->execute', this.req.url, css);
    await BrowserApi.sendTabMessage<FetchCssResponse>({
      type: BusMessageType.CONTENT_FETCH_CSS,
      data: {
        url: this.req.url,
        data: css
      }
    });
  }
}
