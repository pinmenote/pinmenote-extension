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
import { fnConsoleLog } from '../../../common/fn/fn-console';

interface HashtagChange {
  removed: ObjHashtag[];
  added: ObjHashtag[];
}

export class BoardItemMediator {
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
  };

  private static saveHashtagIndex = async (dto: ObjDto<any>, change: HashtagChange) => {
    for (const tag of change.added) {
      await TagHelper.saveTag(tag.value, dto.id);
    }
    for (const tag of change.removed) {
      await TagHelper.removeTag(tag.value, dto.id);
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

class TagHelper {
  static saveTag = async (word: string, id: number) => {
    const key = `${ObjectStoreKeys.TAG_INDEX}:${word}`;
    let arr = await BrowserStorage.get<number[] | undefined>(key);
    if (arr && arr.indexOf(id) !== -1) return;

    if (arr) {
      arr.push(id);
    } else {
      arr = [id];
    }
    await BrowserStorage.set<number[]>(key, arr);
    await this.saveWord(word);
  };

  static removeTag = async (word: string, id: number) => {
    const key = `${ObjectStoreKeys.TAG_INDEX}:${word}`;
    const arr = await BrowserStorage.get<number[] | undefined>(key);

    if (!arr) return;
    const index = arr.indexOf(id);
    if (index === -1) return;

    arr.splice(index, 1);
    await this.removeWord(word);
    if (arr.length === 0) {
      await BrowserStorage.remove(key);
      return;
    }
    await BrowserStorage.set<number[]>(key, arr);
  };

  private static saveWord = async (word: string) => {
    let arr = await BrowserStorage.get<string[] | undefined>(ObjectStoreKeys.TAG_WORD);
    if (arr && arr.indexOf(word) !== -1) return;
    if (arr) {
      arr.push(word);
    } else {
      arr = [word];
    }
    fnConsoleLog('Save word', arr);
    await BrowserStorage.set<string[]>(ObjectStoreKeys.TAG_WORD, arr.sort());
  };

  private static removeWord = async (word: string) => {
    const arr = await BrowserStorage.get<string[] | undefined>(ObjectStoreKeys.TAG_WORD);
    if (!arr) return;

    const index = arr.indexOf(word);
    if (index === -1) return;

    arr.splice(index, 1);
    fnConsoleLog('Remove word', arr);
    await BrowserStorage.set<string[]>(ObjectStoreKeys.TAG_WORD, arr);
  };
}
