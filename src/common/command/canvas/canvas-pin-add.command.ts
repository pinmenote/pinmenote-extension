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
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../../common/model/obj.model';
import { BrowserApi } from '../../service/browser.api.wrapper';
import { BusMessageType } from '../../model/bus.model';
import { ICommand } from '../../model/shared/common.model';
import { ObjCanvasPinDto } from '../../model/obj-pin.model';
import { ObjNextIdCommand } from '../obj/id/obj-next-id.command';

export class CanvasPinAddCommand implements ICommand<Promise<ObjDto<ObjCanvasPinDto>>> {
  constructor(private pin: ObjCanvasPinDto) {}

  async execute(): Promise<ObjDto<ObjCanvasPinDto>> {
    const id = await new ObjNextIdCommand().execute();
    const dt = new Date().toISOString();

    // await new ObjAddIdCommand(id).execute();

    const dto: ObjDto<ObjCanvasPinDto> = {
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

    // const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;

    // await BrowserStorageWrapper.set(key, dto);

    // await LinkHrefOriginStore.addHrefOriginId(this.pin.url, id);

    // Send stop - iframe loads own content scripts
    await BrowserApi.sendRuntimeMessage<undefined>({ type: BusMessageType.CONTENT_PIN_STOP });
    return dto;
  }
}
