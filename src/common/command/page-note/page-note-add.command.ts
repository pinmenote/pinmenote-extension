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
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../model/obj/obj.dto';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjAddIdCommand } from '../obj/id/obj-add-id.command';
import { ObjNextIdCommand } from '../obj/id/obj-next-id.command';
import { ObjPageNoteDto } from '../../model/obj/obj-note.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { SwTaskStore } from '../../store/sw-task.store';
import { SwTaskType } from '../../model/sw-task.model';
import { fnConsoleLog } from '../../fn/fn-console';

export class PageNoteAddCommand implements ICommand<Promise<void>> {
  constructor(private note: ObjPageNoteDto, private dt: number) {}

  async execute(): Promise<void> {
    fnConsoleLog('NoteAddCommand->execute', this.note);

    const id = await new ObjNextIdCommand().execute();

    const dto: ObjDto<ObjPageNoteDto> = {
      id,
      type: ObjTypeDto.PageNote,
      createdAt: this.dt,
      updatedAt: this.dt,
      data: this.note,
      version: OBJ_DTO_VERSION,
      local: {}
    };

    await SwTaskStore.addTask(SwTaskType.WORDS_ADD_INDEX, {
      words: this.note.data.words,
      objectId: id
    });

    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;

    await BrowserStorage.set(key, dto);
    await LinkHrefStore.add(this.note.url, id);
    await LinkHrefStore.noteAdd(this.note.url, id);

    await new ObjAddIdCommand({ id, dt: this.dt }, ObjectStoreKeys.OBJECT_LIST).execute();
  }
}
