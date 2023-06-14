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
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjNoteDto } from '../../model/obj/obj-note.dto';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { WordIndex } from '../../text/word.index';
import { fnConsoleLog } from '../../fn/fn-console';

export class NoteRemoveCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjNoteDto>) {}
  async execute(): Promise<void> {
    fnConsoleLog('NoteRemoveCommand->execute', this.obj);
    await BrowserStorage.remove(`${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`);

    if (this.obj.data.url) {
      await LinkHrefStore.del(this.obj.data.url, this.obj.id);
      await LinkHrefStore.noteDel(this.obj.data.url, this.obj.id);
    }

    await WordIndex.removeFlat(this.obj.data.words, this.obj.id);

    await new ObjRemoveIdCommand({ id: this.obj.id, dt: Date.now() }).execute();
  }
}
