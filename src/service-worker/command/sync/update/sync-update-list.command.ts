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
import { ObjUpdateIndexGetCommand } from '../../../../common/command/obj/date-index/obj-update-index-get.command';
import { SyncGetProgressCommand } from '../progress/sync-get-progress.command';
import { SyncSetProgressCommand } from '../progress/sync-set-progress.command';
import { SyncUpdateObjectCommand } from './sync-update-object.command';
import { fnSleep } from '../../../../common/fn/sleep.fn';

export class SyncUpdateListCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const progress = await new SyncGetProgressCommand().execute();
    if (progress.state !== 'update') return;

    const updated = await new ObjUpdateIndexGetCommand(progress.timestamp).execute();
    let i = updated.indexOf(progress.id) + 1;
    for (i; i < updated.length; i++) {
      const id = updated[i];
      const result = await new SyncUpdateObjectCommand(id, new Date(progress.timestamp)).execute();
      // skip this run because we probably got server error
      if (!result) return;

      progress.id = id;
      await new SyncSetProgressCommand(progress).execute();
      await fnSleep(100);
    }

    progress.state = 'remove';
    await new SyncSetProgressCommand(progress).execute();
  }
}
