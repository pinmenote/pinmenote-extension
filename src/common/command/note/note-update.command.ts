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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ICommand } from '../../model/shared/common.dto';
import { ObjAddUpdatedDateIndexCommand } from '../obj/date-index/obj-add-updated-date-index.command';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjNoteDto } from '../../model/obj/obj-note.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { WordIndex } from '../../text/index/word.index';
import { fnConsoleLog } from '../../fn/console.fn';

export class NoteUpdateCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjNoteDto>, private oldWords: string[]) {}
  async execute(): Promise<void> {
    fnConsoleLog('NoteUpdateCommand->execute', this.obj);
    const key = `${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`;

    await new ObjAddUpdatedDateIndexCommand(this.obj.id, this.obj.updatedAt).execute();

    await WordIndex.removeFlat(this.oldWords, this.obj.id);
    await WordIndex.indexFlat(this.obj.data.words, this.obj.id);

    await BrowserStorageWrapper.set(key, this.obj);
  }
}