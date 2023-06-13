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
import { ICommand } from '../../../model/shared/common.dto';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';
import { PageSegmentDto } from '../../../model/obj/page-segment.dto';

export class PageSegmentGetCommand<T> implements ICommand<Promise<PageSegmentDto<T> | undefined>> {
  constructor(private hash?: string) {}

  async execute(): Promise<PageSegmentDto<T> | undefined> {
    if (!this.hash) return undefined;
    const key = `${ObjectStoreKeys.CONTENT_HASH}:${this.hash}`;
    return await BrowserStorageWrapper.get<PageSegmentDto<T> | undefined>(key);
  }
}