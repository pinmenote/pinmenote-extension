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
import { SegmentImg, SegmentType, SegmentHtml } from '@pinmenote/page-compute';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ApiSegmentGetChildrenCommand } from '../../api/store/segment/api-segment-get-children.command';
import { ApiSegmentGetCommand } from '../../api/store/segment/api-segment-get.command';
import { ObjSingleChange, SegmentHashListResponse, SyncHashType } from '../../api/store/api-store.model';
import { UrlFactory } from '../../../../common/factory/url.factory';
import { PageSegmentAddRefCommand } from '../../../../common/command/snapshot/segment/page-segment-add-ref.command';
import { PageSegmentAddCommand } from '../../../../common/command/snapshot/segment/page-segment-add.command';
import { inflate } from 'pako';
import { fnConsoleLog } from '../../../../common/fn/fn-console';
import { ObjectStoreKeys } from '../../../../common/keys/object.store.keys';
import {
  PageSnapshotDataDto,
  PageSnapshotDto,
  PageSnapshotInfoDto
} from '../../../../common/model/obj/page-snapshot.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { ObjNextIdCommand } from '../../../../common/command/obj/id/obj-next-id.command';
import { OBJ_DTO_VERSION, ObjDto } from '../../../../common/model/obj/obj.dto';
import { SwTaskStore } from '../../../../common/store/sw-task.store';
import { SwTaskType } from '../../../../common/model/sw-task.model';
import { LinkHrefStore } from '../../../../common/store/link-href.store';
import { ObjAddIdCommand } from '../../../../common/command/obj/id/obj-add-id.command';
import { fnSleep } from '../../../../common/fn/fn-sleep';

export class SyncSnapshotIncomingCommand implements ICommand<Promise<boolean>> {
  constructor(private change: ObjSingleChange) {}

  async execute(): Promise<boolean> {
    if (await this.hasObject()) return true;
    // TODO save this hashlist as temp
    const hashList = await new ApiSegmentGetChildrenCommand(this.change.hash).execute();
    if (!hashList) return false;
    const pageSnapshot = await this.getSnapshot(hashList);
    if (!pageSnapshot) {
      fnConsoleLog('SyncSnapshotIncomingCommand->execute PROBLEM !!!!!!!!!!!!!!!!!!!', this.change, hashList);
      return false;
    }
    // sleep 1s for now
    await fnSleep(1000);
    return await this.saveSnapshotDto(pageSnapshot);
  }

  private hasObject = async (): Promise<boolean> => {
    const stored = await BrowserStorage.get(`${ObjectStoreKeys.SERVER_ID}:${this.change.serverId}`);
    return !!stored;
  };

  private saveSnapshotDto = async (snapshot: PageSnapshotDto): Promise<boolean> => {
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

    await BrowserStorage.set(`${ObjectStoreKeys.OBJECT_ID}:${id}`, obj);
    await BrowserStorage.set(`${ObjectStoreKeys.SERVER_ID}:${this.change.serverId}`, id);
    await LinkHrefStore.add(snapshot.info.url, id);
    await new ObjAddIdCommand({ id, dt }, ObjectStoreKeys.OBJECT_LIST).execute();
    return true;
  };

  private getString = async (data: Blob): Promise<string> => {
    const buffer = await data.arrayBuffer();
    const bytes = inflate(new Uint8Array(buffer));
    return new TextDecoder().decode(bytes);
  };

  private getSnapshot = async (hashList: SegmentHashListResponse): Promise<PageSnapshotDto | undefined> => {
    let data: PageSnapshotDataDto | undefined;
    let info: PageSnapshotInfoDto | undefined;
    let segment: string | undefined = undefined;
    for (const child of hashList.children) {
      const segmentData = await new ApiSegmentGetCommand(child.hash, child.mimeType).execute();
      if (!segmentData) continue;
      switch (child.type.toString()) {
        case SyncHashType.Img: {
          const has = await new PageSegmentAddRefCommand(child.hash).execute();
          if (has) break;
          let src = 'data:';
          try {
            src = await UrlFactory.toDataUri(segmentData);
            // @vane WORKAROUND FIX convert image/svg -> image/svg+xml to render correctly inside <img> tag
            if (child.mimeType == 'data:image/svg+xml' && !src.startsWith(child.mimeType))
              src = 'data:image/svg+xml' + src.substring('data:image/svg'.length);
          } catch (e) {
            const buffer = await segmentData.arrayBuffer();
            const textData = new TextDecoder().decode(buffer);
            fnConsoleLog('SyncSnapshotIncomingCommand->getSnapshot->Img->Error !!!', textData);
          }
          const content: SegmentImg = { src };
          await new PageSegmentAddCommand({ type: SegmentType.IMG, hash: child.hash, content }).execute();
          break;
        }
        case SyncHashType.Css: {
          const has = await new PageSegmentAddRefCommand(child.hash).execute();
          if (has) break;
          const content = await this.getString(segmentData);
          await new PageSegmentAddCommand({
            type: SegmentType.CSS,
            hash: child.hash,
            content: JSON.parse(content)
          }).execute();
          break;
        }
        case SyncHashType.IFrame: {
          const has = await new PageSegmentAddRefCommand(child.hash).execute();
          if (has) break;
          const content = await this.getString(segmentData);
          await new PageSegmentAddCommand({
            type: SegmentType.IFRAME,
            hash: child.hash,
            content: JSON.parse(content)
          }).execute();
          break;
        }
        case SyncHashType.PageSnapshotDataDto: {
          const content = await this.getString(segmentData);
          data = JSON.parse(content);
          break;
        }
        case SyncHashType.PageSnapshotInfoDto: {
          const content = await this.getString(segmentData);
          info = JSON.parse(content);
          break;
        }
        case SyncHashType.PageSnapshotFirstHash: {
          segment = child.hash;
          const content = await this.getString(segmentData);
          const html: SegmentHtml = JSON.parse(content);
          await new PageSegmentAddCommand({
            type: SegmentType.SNAPSHOT,
            content: html,
            hash: child.hash
          }).execute();
          break;
        }
        default: {
          throw new Error(`Invalid type ${child.type} and hash ${child.hash}`);
        }
      }
    }
    if (!data || !info) return undefined;
    return { data, info, hash: this.change.hash, segment };
  };
}
