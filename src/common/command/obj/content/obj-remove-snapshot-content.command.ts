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
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ContentSnapshotRemoveListCommand } from '../../snapshot/content-snapshot-remove-list.command';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjRemoveHashtagsCommand } from '../hashtag/obj-remove-hashtags.command';
import { ObjSnapshotContentDto } from '../../../model/obj/obj-content.dto';
import { ObjSnapshotDto } from '../../../model/obj/obj-snapshot.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { WordIndex } from '../../../text/index/word.index';

export class ObjRemoveSnapshotContentCommand implements ICommand<Promise<void>> {
  constructor(private snapshot: ObjSnapshotDto, private id: number) {}
  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.CONTENT_ID}:${this.snapshot.contentId}`;

    const content = await BrowserStorageWrapper.get<ObjSnapshotContentDto>(key);
    await new ContentSnapshotRemoveListCommand(content.hashes).execute();

    await WordIndex.removeFlat(this.snapshot.words, this.id);

    await new ObjRemoveHashtagsCommand(this.id, this.snapshot.hashtags).execute();

    await BrowserStorageWrapper.remove(key);
  }
}
