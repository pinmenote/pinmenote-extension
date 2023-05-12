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
import { ObjRemoveIndexGetCommand } from '../../../../common/command/obj/date-index/obj-remove-index-get.command';
import { SyncGetProgressCommand } from '../progress/sync-get-progress.command';
import { SyncRemoveObjectCommand } from './sync-remove-object.command';
import { SyncSetProgressCommand } from '../progress/sync-set-progress.command';
import { fnSleep } from '../../../../common/fn/sleep.fn';

export class SyncRemoveListCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const progress = await new SyncGetProgressCommand().execute();
    if (progress.state !== 'remove') return;

    const removed = await new ObjRemoveIndexGetCommand(progress.timestamp).execute();

    let i = removed.indexOf(progress.id) + 1;
    for (i; i < removed.length; i++) {
      const id = removed[i];
      await new SyncRemoveObjectCommand(id).execute();

      progress.id = id;
      await new SyncSetProgressCommand(progress).execute();
      await fnSleep(100);
    }
    progress.state = 'update';
    await new SyncSetProgressCommand(progress).execute();
  }
}
