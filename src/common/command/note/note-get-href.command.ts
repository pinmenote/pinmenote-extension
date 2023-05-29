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
import { ObjDto, ObjUrlDto } from '../../model/obj/obj.dto';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjGetCommand } from '../obj/obj-get.command';
import { ObjNoteDto } from '../../model/obj/obj-note.dto';
import { fnConsoleLog } from '../../fn/fn-console';

export class NoteGetHrefCommand implements ICommand<Promise<ObjDto<ObjNoteDto>[]>> {
  constructor(private data: ObjUrlDto) {}

  async execute(): Promise<ObjDto<ObjNoteDto>[]> {
    const ids = (await LinkHrefStore.noteIds(this.data.href)).reverse();
    fnConsoleLog('NoteGetHrefCommand->execute', this.data.href, 'ids->', ids);
    const out: ObjDto<ObjNoteDto>[] = [];

    for (const id of ids) {
      const obj = await new ObjGetCommand<ObjNoteDto>(id).execute();
      out.push(obj);
    }
    return out;
  }
}
