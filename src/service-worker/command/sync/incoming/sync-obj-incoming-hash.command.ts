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
import { SegmentImg, SegmentType } from '@pinmenote/page-compute';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ApiSegmentGetChildrenCommand } from '../../api/store/segment/api-segment-get-children.command';
import { ObjSingleChange, SegmentSingleHash, SyncHashType } from '../../api/store/api-store.model';
import { ApiSegmentGetCommand } from '../../api/store/segment/api-segment-get.command';
import { inflate } from 'pako';
import { UrlFactory } from '../../../../common/factory/url.factory';
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { PageSnapshotDto } from '../../../../common/model/obj/page-snapshot.dto';
import { SwTaskStore } from '../../../../common/store/sw-task.store';
import { SwTaskType } from '../../../../common/model/sw-task.model';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import { LinkHrefStore } from '../../../../common/store/link-href.store';
import { ObjAddIdCommand } from '../../../../common/command/obj/id/obj-add-id.command';
import { PageSegmentAddCommand } from '../../../../common/command/snapshot/segment/page-segment-add.command';
import { ObjNextIdCommand } from '../../../../common/command/obj/id/obj-next-id.command';
import { PageSegmentAddRefCommand } from '../../../../common/command/snapshot/segment/page-segment-add-ref.command';
import { fnSleep } from '../../../../common/fn/fn-sleep';
import { fnConsoleLog } from '../../../../common/fn/fn-console';

interface HashDataElement {
  hash: SegmentSingleHash;
  data: any;
}

type HashData = { [key: string]: HashDataElement };
type HashType = { [key: string]: string[] };

export class SyncObjIncomingHashCommand implements ICommand<Promise<boolean>> {
  constructor(private change: ObjSingleChange) {}
  // TODO store progress in ObjectStoreKeys.SYNC_IN
  async execute(): Promise<boolean> {
    try {
      const result = await this.syncHashList();
      if (!result) {
        fnConsoleLog('PROBLEM syncHashList !!!!!!!!!!!!!!!!!!!', result);
        return false;
      }
      return await this.toDto(result.hashMap, result.hashType);
    } catch (e) {
      fnConsoleLog('PROBLEM 222222222222 SyncObjIncomingHashCommand->syncHashList', e);
      return false;
    }
  }

  private syncHashList = async (): Promise<{ hashType: HashType; hashMap: HashData } | undefined> => {
    const hashList = await new ApiSegmentGetChildrenCommand(this.change.hash).execute();
    if (!hashList) return undefined;
    hashList.children.sort((a, b) => {
      if (a.type > b.type) return 1;
      if (a.type < b.type) return -1;
      return 0;
    });
    const hashType: HashType = {};
    const hashMap: HashData = {};
    for (const child of hashList.children) {
      const data = await new ApiSegmentGetCommand(child.hash).execute();
      if (!data) continue;

      if (child.type.toString() === SyncHashType.Img) {
        const src = await UrlFactory.toDataUri(data);
        const content: SegmentImg = { src };
        const has = new PageSegmentAddRefCommand(child.hash);
        if (has) continue;
        await new PageSegmentAddCommand({ type: SegmentType.IMG, hash: child.hash, content }).execute();
        continue;
      }
      const buffer = await data.arrayBuffer();
      const bytes = inflate(new Uint8Array(buffer));
      const content = new TextDecoder().decode(bytes);

      if (child.type.toString() === SyncHashType.Css) {
        const has = new PageSegmentAddRefCommand(child.hash);
        if (has) continue;
        await new PageSegmentAddCommand({
          type: SegmentType.CSS,
          hash: child.hash,
          content: JSON.parse(content)
        }).execute();
      } else if (child.type.toString() === SyncHashType.IFrame) {
        const has = new PageSegmentAddRefCommand(child.hash);
        if (has) continue;
        await new PageSegmentAddCommand({
          type: SegmentType.IFRAME,
          hash: child.hash,
          content: JSON.parse(content)
        }).execute();
      } else {
        if (!hashType[child.type.toString()]) hashType[child.type.toString()] = [];
        hashType[child.type.toString()].push(child.hash);
        hashMap[child.hash] = { hash: child, data: JSON.parse(content) };
      }
    }
    return { hashMap, hashType };
  };

  private toDto = async (hashData: HashData, type: HashType) => {
    switch (this.change.type) {
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        return await this.saveSnapshotDto(hashData, type);
      }
      default:
        throw new Error(`Unsupported type ${this.change.type}`);
    }
    return false;
  };

  private saveSnapshotDto = async (hashData: HashData, type: HashType): Promise<boolean> => {
    const stored = await BrowserStorage.get(`${ObjectStoreKeys.SERVER_ID}:${this.change.serverId}`);
    if (stored) return true;

    const segmentArray = type[SyncHashType.PageSnapshotFirstHash];
    let segment = undefined;
    if (segmentArray && segmentArray.length === 1) {
      segment = segmentArray[0];
    }

    const snapshot: PageSnapshotDto = {
      data: hashData[type[SyncHashType.PageSnapshotDataDto][0]].data,
      info: hashData[type[SyncHashType.PageSnapshotInfoDto][0]].data,
      hash: this.change.hash,
      segment
    };
    // TODO - sync incoming comments !!!!!!!!!!!
    const data: ObjPageDto = {
      snapshot: snapshot,
      comments: { data: [] }
    };
    const id = await new ObjNextIdCommand().execute();
    const dt = Date.now();
    // Add createdAt, updatedAt, VERSION ----> TO SERVER
    const obj: ObjDto<ObjPageDto> = {
      id,
      data,
      server: { id: this.change.serverId },
      version: OBJ_DTO_VERSION,
      createdAt: dt,
      updatedAt: dt,
      type: this.change.type,
      local: {
        visible: true,
        drawVisible: false
      }
    };
    await SwTaskStore.addTask(SwTaskType.WORDS_ADD_INDEX, {
      words: snapshot.info.words,
      objectId: id
    });

    if (segment) {
      for (const hash of type[SyncHashType.PageSnapshotFirstHash]) {
        const has = new PageSegmentAddRefCommand(hash);
        if (has) continue;
        await new PageSegmentAddCommand({
          type: SegmentType.SNAPSHOT,
          content: hashData[hash].data,
          hash
        }).execute();
      }
    }

    await BrowserStorage.set(`${ObjectStoreKeys.OBJECT_ID}:${id}`, obj);
    await BrowserStorage.set(`${ObjectStoreKeys.SERVER_ID}:${this.change.serverId}`, id);
    await LinkHrefStore.add(snapshot.info.url, id);
    await new ObjAddIdCommand({ id, dt }, ObjectStoreKeys.OBJECT_LIST).execute();
    await fnSleep(1000);
    return true;
  };
}
