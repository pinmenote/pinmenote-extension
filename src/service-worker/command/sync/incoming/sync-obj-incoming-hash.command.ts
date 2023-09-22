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
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ApiSegmentGetChildrenCommand } from '../../api/store/segment/api-segment-get-children.command';
import { ObjSingleChange, SyncHashType } from '../../api/store/api-store.model';
import { ApiSegmentGetCommand } from '../../api/store/segment/api-segment-get.command';
import { inflate } from 'pako';
import { UrlFactory } from '../../../../common/factory/url.factory';

export class SyncObjIncomingHashCommand implements ICommand<Promise<void>> {
  constructor(private change: ObjSingleChange) {}
  async execute(): Promise<void> {
    const hashList = await new ApiSegmentGetChildrenCommand(this.change.hash).execute();
    if (!hashList) return;
    for (const child of hashList.children) {
      const data = await new ApiSegmentGetCommand(child.hash).execute();
      if (!data) continue;
      if (child.type.toString() === SyncHashType.Img) {
        const img = await UrlFactory.toDataUri(data);
        console.log('img', img.length);
      } else {
        const buffer = await data.arrayBuffer();
        const bytes = inflate(new Uint8Array(buffer));
        const segment = new TextDecoder().decode(bytes);
        console.log('ooo', JSON.parse(segment), child.type);
      }
    }
    console.log('hashList', hashList);
  }
}
