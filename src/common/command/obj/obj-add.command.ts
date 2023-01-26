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
import { OBJ_DTO_VERSION, ObjDataDto, ObjDto, ObjTypeDto } from '../../model/obj.model';
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { HashtagFindCommand } from './hashtag/hashtag-find.command';
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjHashtagStore } from '../../store/obj-hashtag.store';
import { ObjNextIdCommand } from './id/obj-next-id.command';
import { ObjPagePinDto } from '../../model/obj-pin.model';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnUid } from '../../fn/uid.fn';
import ICommand = Pinmenote.Common.ICommand;

export class ObjAddCommand implements ICommand<Promise<void>> {
  constructor(private data: ObjDataDto, private type: ObjTypeDto) {}

  async execute(): Promise<void> {
    const id = await new ObjNextIdCommand().execute();
    const dt = new Date().toISOString();
    const dto: ObjDto = {
      id,
      uid: fnUid(),
      version: OBJ_DTO_VERSION,
      type: this.type,
      createdAt: dt,
      updatedAt: dt,
      encryption: {
        encrypted: false
      },
      hashtags: []
    };
    switch (this.type) {
      case ObjTypeDto.PageElementPin: {
        dto.data = this.data;
        const pin = this.data as ObjPagePinDto;

        dto.hashtags = new HashtagFindCommand(pin.value).execute();
        await this.addHashtags(id, dto.hashtags);

        await LinkHrefOriginStore.addHrefOriginId(pin.url, id);
        break;
      }
    }
    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;
    await BrowserStorageWrapper.set(key, dto);
  }

  private async addHashtags(id: number, hashtags: string[]) {
    for (const tag of hashtags) {
      await ObjHashtagStore.addHashtag(tag, id);
    }
  }
}
