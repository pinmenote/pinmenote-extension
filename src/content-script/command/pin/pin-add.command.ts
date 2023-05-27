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
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ContentPageSnapshotAddCommand } from '../snapshot/content-page-snapshot-add.command';
import { ICommand } from '../../../common/model/shared/common.dto';
import { LinkHrefOriginStore } from '../../../common/store/link-href-origin.store';
import { ObjNextIdCommand } from '../../../common/command/obj/id/obj-next-id.command';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class PinAddCommand implements ICommand<Promise<ObjDto<ObjPinDto>>> {
  constructor(private pin: ObjPinDto) {}

  async execute(): Promise<ObjDto<ObjPinDto>> {
    fnConsoleLog('PinAddCommand->execute', this.pin);

    const id = await new ObjNextIdCommand(ObjectStoreKeys.PIN_ID).execute();
    const dt = Date.now();

    const dto: ObjDto<ObjPinDto> = {
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
      }
    };

    const key = `${ObjectStoreKeys.PIN_ID}:${id}`;

    await BrowserStorageWrapper.set(key, dto);

    await LinkHrefOriginStore.pinAdd(this.pin.url, id);

    const hasSnapshot = await LinkHrefOriginStore.hasPageSnapshot(this.pin.url.href);
    if (!hasSnapshot) {
      await new ContentPageSnapshotAddCommand(this.pin.url).execute();
    }

    // Send stop - iframe loads own content scripts
    await BrowserApi.sendRuntimeMessage<undefined>({ type: BusMessageType.CONTENT_STOP_LISTENERS });
    return dto;
  }
}