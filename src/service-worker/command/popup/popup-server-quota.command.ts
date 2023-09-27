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
import { ApiSegmentQuotaGetCommand } from '../api/store/segment/api-segment-quota-get.command';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import { ICommand, ServerErrorDto } from '../../../common/model/shared/common.dto';
import { ServerQuotaResponse } from '../../../common/model/sync-server.model';

export class PopupServerQuotaCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const data = await new ApiSegmentQuotaGetCommand().execute();
    await BrowserApi.sendRuntimeMessage<ServerQuotaResponse | ServerErrorDto>({
      type: BusMessageType.POPUP_SERVER_QUOTA,
      data
    });
  }
}