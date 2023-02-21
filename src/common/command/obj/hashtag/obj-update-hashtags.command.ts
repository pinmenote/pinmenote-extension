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
import { HashtagFindCommand } from './hashtag-find.command';
import { ICommand } from '../../../model/shared/common.dto';
import { ObjHashtagStore } from '../../../store/obj-hashtag.store';

export class ObjUpdateHashtagsCommand implements ICommand<Promise<void>> {
  constructor(private id: number, private oldValue: string, private newValue: string) {}
  async execute(): Promise<void> {
    const oldHashtags = new HashtagFindCommand(this.oldValue).execute();
    const newHashtags = new HashtagFindCommand(this.newValue).execute();

    const updateTags = this.shouldUpdateTags(newHashtags, oldHashtags);
    if (updateTags) {
      await this.clearHashtags(oldHashtags);
      await this.addHashtags(newHashtags);
    }
  }

  private shouldUpdateTags(a?: string[], b?: string[]): boolean {
    if (a === b) return false;
    if (a == undefined && b == undefined) return false;
    if (a == undefined || b == undefined) return true;
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return true;
    }
    return false;
  }

  private async addHashtags(hashtags: string[]): Promise<void> {
    for (const tag of hashtags) {
      await ObjHashtagStore.addHashtag(tag, this.id);
    }
  }

  private async clearHashtags(hashtags: string[]): Promise<void> {
    for (const tag of hashtags) {
      await ObjHashtagStore.delHashtag(tag, this.id);
    }
  }
}
