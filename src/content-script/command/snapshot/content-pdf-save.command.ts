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
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import { FetchPDFRequest } from '../../../common/model/obj-request.model';
import { FetchResponse } from '@pinmenote/fetch-service';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { PdfAddCommand } from '../../../common/command/pdf/pdf-add.command';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class ContentPdfSaveCommand implements ICommand<Promise<void>> {
  constructor(private url: ObjUrlDto) {}
  async execute(): Promise<void> {
    const data: FetchPDFRequest = { url: this.url.href };
    TinyDispatcher.getInstance().addListener<FetchResponse<string>>(
      BusMessageType.CONTENT_FETCH_PDF,
      async (event, key, value) => {
        if (value.url === this.url.href) {
          TinyDispatcher.getInstance().removeListener(event, key);
          fnConsoleLog('ContentPdfSaveCommand->Downloaded', value);
          if (value.ok) {
            await new PdfAddCommand(value).execute();
          }
        }
      }
    );
    fnConsoleLog('ContentPdfSaveCommand->CONTENT_FETCH_PDF', data);
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.CONTENT_FETCH_PDF, data });
  }
}
