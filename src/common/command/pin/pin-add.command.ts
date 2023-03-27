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
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../model/obj/obj.dto';
import { BrowserApi } from '../../service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { BusMessageType } from '../../model/bus.model';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjAddIdCommand } from '../obj/id/obj-add-id.command';
import { ObjNextIdCommand } from '../obj/id/obj-next-id.command';
import { ObjPagePinDto } from '../../model/obj/obj-pin.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/console.fn';

export class PinAddCommand implements ICommand<Promise<ObjDto<ObjPagePinDto>>> {
  constructor(private pin: ObjPagePinDto) {}

  async execute(): Promise<ObjDto<ObjPagePinDto>> {
    fnConsoleLog('PinAddCommand->execute', this.pin);

    const id = await new ObjNextIdCommand().execute();
    const dt = Date.now();

    const dto: ObjDto<ObjPagePinDto> = {
      id,
      type: ObjTypeDto.PageElementPin,
      createdAt: dt,
      updatedAt: dt,
      data: this.pin,
      version: OBJ_DTO_VERSION,
      local: {
        visible: true
      },
      encryption: {
        encrypted: false
      },
      hashtags: []
    };

    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;

    await BrowserStorageWrapper.set(key, dto);

    await LinkHrefOriginStore.addHrefOriginId(this.pin.snapshot.url, id);

    await new ObjAddIdCommand(id, dt).execute();

    // Send stop - iframe loads own content scripts
    await BrowserApi.sendRuntimeMessage<undefined>({ type: BusMessageType.CONTENT_PIN_STOP });
    return dto;
  }
}
