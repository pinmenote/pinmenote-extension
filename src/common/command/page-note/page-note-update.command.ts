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
import { ObjPageNoteDto } from '../../model/obj/obj-note.dto';
import { ObjUpdateIndexAddCommand } from '../obj/index/obj-update-index-add.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { WordIndex } from '../../text/word.index';
import { fnConsoleLog } from '../../fn/fn-console';
import { fnSha256 } from '../../fn/fn-hash';

export class PageNoteUpdateCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjPageNoteDto>, private title: string, private description: string) {}
  async execute(): Promise<void> {
    fnConsoleLog('NoteUpdateCommand->execute', this.obj);
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;
    this.obj.data.prev = this.obj.data.hash;
    this.obj.data.hash = fnSha256(this.title + this.description);

    this.obj.data.title = this.title;
    this.obj.data.description = this.description;
    this.obj.updatedAt = Date.now();

    await WordIndex.removeFlat(this.obj.data.words, this.obj.id);
    await WordIndex.indexFlat(this.obj.data.words, this.obj.id);

    await BrowserStorage.set(key, this.obj);

    await new ObjUpdateIndexAddCommand({ id: this.obj.id, dt: this.obj.updatedAt }).execute();
  }
}
