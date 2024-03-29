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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjNoteDataDto, ObjPageNoteDto } from '../../model/obj/obj-note.dto';
import { ObjUpdateIndexAddCommand } from '../obj/index/obj-update-index-add.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { SwTaskStore } from '../../store/sw-task.store';
import { SwTaskType } from '../../model/sw-task.model';
import { WordFactory } from '../../text/word.factory';
import { fnConsoleLog } from '../../fn/fn-console';
import { fnSha256Object } from '../../fn/fn-hash';

export class PageNoteUpdateCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjPageNoteDto>, private title: string, private description: string) {}
  async execute(): Promise<void> {
    fnConsoleLog('NoteUpdateCommand->execute', this.obj);
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;
    const dt = Date.now();

    // allow access to previous values
    await BrowserStorage.set<ObjPageNoteDto>(`${ObjectStoreKeys.NOTE_HASH}:${this.obj.data.hash}`, this.obj.data);

    this.obj.data.prev = this.obj.data.hash;

    const words = new Set<string>([...WordFactory.toWordList(this.title), ...WordFactory.toWordList(this.description)]);

    const newData: ObjNoteDataDto = {
      title: this.title,
      description: this.description,
      words: Array.from(words)
    };
    this.obj.data.hash = fnSha256Object({ ...newData, url: this.obj.data.url, dt });

    this.obj.data.data = newData;
    this.obj.updatedAt = dt;

    // Remove words from index
    await SwTaskStore.addTask(SwTaskType.WORDS_REMOVE_INDEX, {
      words: this.obj.data.data.words,
      objectId: this.obj.id
    });

    await SwTaskStore.addTask(SwTaskType.WORDS_ADD_INDEX, {
      words: Array.from(words),
      objectId: this.obj.id
    });

    await BrowserStorage.set(key, this.obj);

    await new ObjUpdateIndexAddCommand({ id: this.obj.id, dt: this.obj.updatedAt }).execute();
  }
}
