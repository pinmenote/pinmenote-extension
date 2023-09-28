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
import { ObjHashtag, ObjHashtagable } from '../../../common/model/obj/obj-hashtag.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { BrowserStorage } from '@pinmenote/browser-api';
import { BoardStore } from '../../store/board.store';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnSha256Object } from '../../../common/fn/fn-hash';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { BusMessageType } from '../../../common/model/bus.model';
import { HashtagStore } from '../../../common/store/hashtag.store';

interface HashtagChange {
  removed: ObjHashtag[];
  added: ObjHashtag[];
}

export class BoardItemMediator {
  static fetchTags = async (): Promise<string[]> => {
    const tags = await BrowserStorage.get<string[] | undefined>(ObjectStoreKeys.TAG_WORD);
    return tags || [];
  };

  static removeObject = async (obj: ObjDto, refreshCallback: () => void) => {
    if (await BoardStore.removeObj(obj)) {
      refreshCallback();
    }
  };

  static saveTags = async (
    dto: ObjDto<ObjHashtagable>,
    newTags: ObjHashtag[],
    setNewTags: (newTags: ObjHashtag[]) => void
  ) => {
    if (dto.data.hashtags) {
      const changed = this.resolveHashtagsChange(dto.data.hashtags.data, newTags);
      await this.saveHashtagIndex(dto, changed);
    } else {
      dto.data.hashtags = { data: [], hash: '' };
    }

    dto.data.hashtags.hash = fnSha256Object(newTags);
    dto.data.hashtags.data = newTags;
    await BrowserStorage.set<ObjDto<any>>(`${ObjectStoreKeys.OBJECT_ID}:${dto.id}`, dto);
    await this.saveHashtagIndex(dto, { added: newTags, removed: [] });
    setNewTags(newTags);
    TinyDispatcher.getInstance().dispatch(BusMessageType.POP_REFRESH_TAGS);
  };

  private static saveHashtagIndex = async (dto: ObjDto<any>, change: HashtagChange) => {
    for (const tag of change.added) {
      await HashtagStore.saveTag(tag.value, dto.id);
    }
    for (const tag of change.removed) {
      await HashtagStore.removeTag(tag.value, dto.id);
    }
  };

  private static resolveHashtagsChange = (oldTags: ObjHashtag[], newTags: ObjHashtag[]): HashtagChange => {
    const removed: ObjHashtag[] = [];
    const added = newTags.concat();
    for (let i = 0; i < oldTags.length; i++) {
      const tag = oldTags[i];
      const index = newTags.findIndex((v) => v.value === tag.value);
      if (index < 0) {
        removed.push(tag);
      } else {
        added.splice(index, 1);
      }
    }
    return { removed, added };
  };
}

export class TagHelper {}
