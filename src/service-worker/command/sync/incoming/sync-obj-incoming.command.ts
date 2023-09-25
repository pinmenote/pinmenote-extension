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
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjSingleChange } from '../../api/store/api-store.model';
import { ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { SyncSnapshotIncomingCommand } from './sync-snapshot-incoming.command';
import { fnSleep } from '../../../../common/fn/fn-sleep';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

export class SyncObjIncomingCommand implements ICommand<Promise<boolean>> {
  constructor(private change: ObjSingleChange) {}
  // TODO store progress in ObjectStoreKeys.SYNC_IN
  async execute(): Promise<boolean> {
    switch (this.change.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        return await new SyncSnapshotIncomingCommand(this.change).execute();
      }
      case ObjTypeDto.Pdf:
        return await this.savePdf();
      default:
        throw new Error(`Unsupported type ${this.change.type}`);
    }
    return false;
  }

  private savePdf = async (): Promise<boolean> => {
    fnConsoleLog('SyncObjIncomingCommand->savePdf UNSUPPORTED PDF', this.change);
    await fnSleep(1000);
    return false;
  };
}
