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
import { BrowserStorageWrapper } from '../../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { ServerPathDto } from '../../../../common/model/obj/obj-server.dto';
import { fnConsoleLog } from '../../../../common/fn/console.fn';
import { fnSleep } from '../../../../common/fn/sleep.fn';

export class SyncSendChangesCommand implements ICommand<Promise<void>> {
  constructor(private obj: ObjDto) {}
  async execute(): Promise<void> {
    if (!this.obj.server) return;
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;

    const changes = this.obj.server.changes;
    while (changes.length > 0) {
      switch (changes[0].path) {
        case ServerPathDto.OBJ:
        case ServerPathDto.HASHTAGS:
        case ServerPathDto.WORDS:
        case ServerPathDto.COMMENT:
        case ServerPathDto.DRAW:
        case ServerPathDto.NOTE:
        case ServerPathDto.PIN:
        case ServerPathDto.SNAPSHOT:
        case ServerPathDto.SNAPSHOT_CONTENT:
        case ServerPathDto.SNAPSHOT_CSS:
          fnConsoleLog('SyncSendChangesCommand->send', this.obj.id, changes[0]);
          await fnSleep(10);
          // remove change from changes
          break;
      }
      changes.shift();
      await BrowserStorageWrapper.set<ObjDto>(key, this.obj);
    }
  }
}
