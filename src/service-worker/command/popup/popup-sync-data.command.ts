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
import { BoolDto, ICommand } from '../../../common/model/shared/common.dto';
import { ApiStoreCreateCommand } from '../api/api-store-create.command';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class PopupSyncDataCommand implements ICommand<void> {
  async execute(): Promise<void> {
    try {
      const createResult = await new ApiStoreCreateCommand().execute();
      fnConsoleLog('PopupSyncDataCommand->createResult', createResult);

      await BrowserApi.sendRuntimeMessage<BoolDto>({
        type: BusMessageType.POPUP_SYNC_DATA,
        data: {
          value: true
        }
      });
    } catch (e) {
      fnConsoleLog('Error', e);
    }
  }
}