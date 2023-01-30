/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../model/obj.model';
import { BrowserApi } from '../../service/browser.api.wrapper';
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { BusMessageType } from '../../model/bus.model';
import { HashtagFindCommand } from '../obj/hashtag/hashtag-find.command';
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjAddHashtagsCommand } from '../obj/hashtag/obj-add-hashtags.command';
import { ObjAddIdCommand } from '../obj/id/obj-add-id.command';
import { ObjNextIdCommand } from '../obj/id/obj-next-id.command';
import { ObjPagePinDto } from '../../model/obj-pin.model';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class PinAddCommand implements ICommand<Promise<ObjDto<ObjPagePinDto>>> {
  constructor(private pin: ObjPagePinDto) {}

  async execute(): Promise<ObjDto<ObjPagePinDto>> {
    fnConsoleLog('PinAddCommand->execute', this.pin);

    const id = await new ObjNextIdCommand().execute();
    const dt = new Date().toISOString();
    const hashtags = new HashtagFindCommand(this.pin.value).execute();

    await new ObjAddIdCommand(id).execute();
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
      hashtags
    };

    await new ObjAddHashtagsCommand(id, hashtags).execute();

    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;

    await BrowserStorageWrapper.set(key, dto);

    await LinkHrefOriginStore.addHrefOriginId(this.pin.url, id);

    // Send stop - iframe loads own content scripts
    await BrowserApi.sendRuntimeMessage<undefined>({ type: BusMessageType.CONTENT_PIN_STOP });
    return dto;
  }
}
