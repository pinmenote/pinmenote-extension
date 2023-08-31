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
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDateIndex } from '../../../common/command/obj/index/obj-update-index-add.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { SyncObjectCommand } from './obj/sync-object.command';
import { SyncProgress } from './sync.model';
import { SyncTxHelper } from './sync-tx.helper';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class SyncMonthCommand implements ICommand<Promise<ObjDateIndex>> {
  constructor(private progress: SyncProgress, private yearMonth: string) {}
  async execute(): Promise<ObjDateIndex> {
    fnConsoleLog('SyncMonthCommand->syncMonth', this.yearMonth);

    let index = { dt: this.progress.timestamp, id: this.progress.id };

    const updatedDt = `${ObjectStoreKeys.UPDATED_DT}:${this.yearMonth}`;
    const indexList = await SyncTxHelper.getList(updatedDt);
    fnConsoleLog('SyncMonthCommand->syncList', indexList);

    if (indexList.length === 0) return index;

    const lastIndexElement = indexList[indexList.length - 1];
    fnConsoleLog('SyncMonthCommand->last', lastIndexElement, 'progress', this.progress);
    // we are last so escape early, so we don't waste request for begin / commit
    if (this.progress.id === lastIndexElement.id && this.progress.timestamp === lastIndexElement.dt) return index;

    let nextObjectIndex = indexList.findIndex((value) => value.id === this.progress.id);
    fnConsoleLog(
      'SyncMonthCommand->nextObjectIndex',
      nextObjectIndex,
      indexList.length,
      this.progress,
      indexList[nextObjectIndex]
    );

    if (nextObjectIndex === -1) nextObjectIndex = 0;

    await SyncTxHelper.begin();

    for (let i = nextObjectIndex; i < indexList.length; i++) {
      index = indexList[i];
      await new SyncObjectCommand(this.progress, index).execute();
    }

    await SyncTxHelper.commit();
    return index;
  }
}
