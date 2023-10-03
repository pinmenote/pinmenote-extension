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
import { ObjDto, ObjRemovedDto, ObjTypeDto } from '../../model/obj/obj.dto';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjPageNoteDto } from '../../model/obj/obj-note.dto';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { SwTaskStore } from '../../store/sw-task.store';
import { SwTaskType } from '../../model/sw-task.model';
import { fnConsoleLog } from '../../fn/fn-console';
import { HashtagStore } from '../../store/hashtag.store';
import { ObjUpdateIndexAddCommand } from '../obj/index/obj-update-index-add.command';

export class PageNoteRemoveCommand implements ICommand<void> {
  constructor(private obj: ObjDto<ObjPageNoteDto>) {}
  async execute(): Promise<void> {
    fnConsoleLog('NoteRemoveCommand->execute', this.obj);
    const data = this.obj.data;

    await this.cleanPrevHash(data);

    await LinkHrefStore.del(data.url, this.obj.id);
    await LinkHrefStore.noteDel(data.url, this.obj.id);

    await new ObjRemoveIdCommand(this.obj.id, ObjectStoreKeys.OBJECT_LIST).execute();

    const obj: ObjRemovedDto = {
      id: this.obj.id,
      server: this.obj.server,
      type: ObjTypeDto.Removed,
      hash: this.obj.data.hash,
      removedAt: Date.now()
    };
    await new ObjUpdateIndexAddCommand({ id: obj.id, dt: obj.removedAt }).execute();
    await BrowserStorage.set(`${ObjectStoreKeys.OBJECT_ID}:${this.obj.id}`, obj);

    if (data.hashtags) {
      await HashtagStore.removeTags(
        data.hashtags.data.map((t) => t.value),
        this.obj.id
      );
    }

    await SwTaskStore.addTask(SwTaskType.WORDS_REMOVE_INDEX, {
      words: data.data.words,
      objectId: this.obj.id
    });
  }

  private async cleanPrevHash(data: ObjPageNoteDto): Promise<void> {
    let prevHash = data.prev;
    while (prevHash) {
      const prevKey = `${ObjectStoreKeys.NOTE_HASH}:${prevHash}`;
      const prevData = await BrowserStorage.get<ObjPageNoteDto | undefined>(prevKey);
      prevHash = prevData?.prev;
      await BrowserStorage.remove(prevKey);
    }
  }
}
