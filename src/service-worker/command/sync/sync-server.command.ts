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
import { fnDateToMonthFirstDay, fnMonthLastDay } from '../../../common/fn/fn-date';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDateIndex } from '../../../common/command/obj/index/obj-update-index-add.command';
import { ObjGetCommand } from '../../../common/command/obj/obj-get.command';
import { ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncGetProgressCommand } from './progress/sync-get-progress.command';
import { SyncProgress } from './sync.model';
import { SyncResetProgressCommand } from './progress/sync-reset-progress.command';
import { SyncSetProgressCommand } from './progress/sync-set-progress.command';
import { SyncTxHelper } from './sync-tx.helper';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnDateKeyFormat } from '../../../common/fn/fn-date-format';
import { fnSleep } from '../../../common/fn/fn-sleep';

export class SyncServerCommand implements ICommand<Promise<void>> {
  private static isInSync = false;

  async execute(): Promise<void> {
    if (SyncServerCommand.isInSync) return;
    if (!(await SyncTxHelper.shouldSync())) return;
    try {
      // await new SyncResetProgressCommand().execute();

      SyncServerCommand.isInSync = true;

      const a = Date.now();
      const progress = await new SyncGetProgressCommand().execute();
      await this.sync(progress);

      fnConsoleLog('SyncServerCommand->execute-progress', progress, 'in', Date.now() - a);
    } finally {
      SyncServerCommand.isInSync = false;
    }
  }

  private async sync(progress: SyncProgress): Promise<void> {
    const dt = fnDateToMonthFirstDay(new Date(progress.timestamp));
    const lastDay = fnMonthLastDay();
    while (dt < lastDay) {
      const yearMonth = fnDateKeyFormat(dt);
      await this.syncMonth(progress, yearMonth);
      dt.setMonth(dt.getMonth() + 1);
      fnConsoleLog('sync dt', dt, 'lastDay', lastDay);
    }
  }

  private async syncMonth(progress: SyncProgress, yearMonth: string): Promise<void> {
    fnConsoleLog('SyncServerCommand->syncMonth', yearMonth);

    const updatedDt = `${ObjectStoreKeys.UPDATED_DT}:${yearMonth}`;
    const indexList = await SyncTxHelper.getList(updatedDt);
    fnConsoleLog('syncMonth->syncList', indexList);
    if (indexList.length === 0) return;

    let nextObjectIndex = indexList.findIndex((value) => value.id === progress.id);
    fnConsoleLog('syncMonth->AAA', nextObjectIndex, indexList.length, progress, indexList[nextObjectIndex]);

    if (nextObjectIndex === -1) nextObjectIndex = 0;

    await SyncTxHelper.begin();

    let timestamp = 0;

    for (let i = nextObjectIndex; i < indexList.length; i++) {
      const index = indexList[i];
      await this.syncObject(progress, index);
      timestamp = index.dt;
    }

    // set to -1 for next list
    await new SyncSetProgressCommand({
      id: -1,
      timestamp,
      state: 'update'
    }).execute();

    await SyncTxHelper.commit();
  }

  private syncObject = async (progress: SyncProgress, index: ObjDateIndex) => {
    if (!index) {
      fnConsoleLog('PROBLEM', index, progress);
      return;
    }
    const obj = await new ObjGetCommand(index.id).execute();
    if (!obj) {
      fnConsoleLog('syncObject EMPTY', index.id);
      return;
    }
    switch (obj.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        // const data = obj.data as ObjPageDto;
        // const pageSegment = await new PageSegmentGetCommand<SegmentPage>(data.snapshot.segmentHash).execute();
        // fnConsoleLog(obj.type, obj.id, 'index', index, 'obj', obj);
        break;
      }
      case ObjTypeDto.PageElementPin: {
        fnConsoleLog(obj.type, obj.id, 'index', index, 'obj', obj);
        break;
      }
      default: {
        fnConsoleLog('PROBLEM', obj.type, 'index', index);
        break;
      }
    }
    await fnSleep(1);
    await new SyncSetProgressCommand({ id: index.id, timestamp: index.dt, state: 'update' }).execute();
  };
}
