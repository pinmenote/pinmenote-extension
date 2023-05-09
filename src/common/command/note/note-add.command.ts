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
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjAddIdCommand } from '../obj/id/obj-add-id.command';
import { ObjNextIdCommand } from '../obj/id/obj-next-id.command';
import { ObjNoteDto } from '../../model/obj/obj-note.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { WordIndex } from '../../text/index/word.index';
import { fnConsoleLog } from '../../fn/console.fn';

export class NoteAddCommand implements ICommand<Promise<void>> {
  constructor(private note: ObjNoteDto) {}

  async execute(): Promise<void> {
    fnConsoleLog('NoteAddCommand->execute', this.note);

    const id = await new ObjNextIdCommand().execute();
    const dt = Date.now();

    const dto: ObjDto<ObjNoteDto> = {
      id,
      type: ObjTypeDto.PageNote,
      createdAt: dt,
      updatedAt: dt,
      data: this.note,
      version: OBJ_DTO_VERSION,
      local: {},
      encryption: {
        encrypted: false
      }
    };

    await WordIndex.indexFlat(this.note.words, id);

    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;

    await BrowserStorageWrapper.set(key, dto);
    if (this.note.url) {
      await LinkHrefOriginStore.addHrefOriginId(this.note.url, id);
      await LinkHrefOriginStore.noteAdd(this.note.url, id);
    }

    await new ObjAddIdCommand(id, dt).execute();
  }
}