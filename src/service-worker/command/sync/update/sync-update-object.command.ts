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
import { ObjDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjUpdateIndexDelCommand } from '../../../../common/command/obj/date-index/obj-update-index-del.command';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

export class SyncUpdateObjectCommand implements ICommand<Promise<void>> {
  constructor(private id: number, private dt: Date) {}
  async execute(): Promise<void> {
    const obj = await BrowserStorageWrapper.get<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${this.id}`);
    if (!obj) {
      await new ObjUpdateIndexDelCommand(this.id, this.dt).execute();
      return;
    }
    switch (obj.type) {
      case ObjTypeDto.PageElementSnapshot:
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementPin: {
        // const d = obj.data as ObjPageDto;
        fnConsoleLog('SyncUpdateObjectCommand->execute->contentId', this.id);
        break;
      }
    }
  }
}
