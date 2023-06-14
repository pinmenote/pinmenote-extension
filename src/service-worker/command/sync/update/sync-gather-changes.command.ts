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
import { ObjDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { ServerChangeDto, ServerPathDto } from '../../../../common/model/obj/obj-server.dto';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDrawDto } from '../../../../common/model/obj/obj-draw.dto';
import { ObjNoteDto } from '../../../../common/model/obj/obj-note.dto';
import { ObjPageDto } from '../../../../common/model/obj/obj-page.dto';
import { ObjPinDto } from '../../../../common/model/obj/obj-pin.dto';
import { PageSegmentGetCommand } from '../../../../common/command/snapshot/segment/page-segment-get.command';
import { SegmentPage } from '@pinmenote/page-compute';

export class SyncGatherChangesCommand implements ICommand<Promise<ServerChangeDto[]>> {
  constructor(private obj: ObjDto) {}

  async execute(): Promise<ServerChangeDto[]> {
    let changes: ServerChangeDto[] = [];

    switch (this.obj.type) {
      case ObjTypeDto.PageElementSnapshot:
      case ObjTypeDto.PageSnapshot: {
        const pageObj = this.obj.data as ObjPageDto;
        changes = await this.pageChanges(pageObj);
        break;
      }
      case ObjTypeDto.PageElementPin: {
        const pin = this.obj.data as ObjPinDto;
        changes = this.commentChanges(pin.comments.data);
        const drawChanges = this.drawChanges(pin.draw.data);
        changes.push(...drawChanges);
        changes.push({ type: 'upload', path: ServerPathDto.PIN, hash: pin.data.hash });
        break;
      }
      case ObjTypeDto.PageNote: {
        const note = this.obj.data as ObjNoteDto;
        changes.push({ type: 'upload', path: ServerPathDto.NOTE, hash: note.hash });
      }
    }
    return changes;
  }

  private pageChanges = async (pageObj: ObjPageDto): Promise<ServerChangeDto[]> => {
    const changes: ServerChangeDto[] = [];

    if (pageObj.snapshot.segmentHash) {
      const snapshot = await this.snapshotChanges(pageObj.snapshot.segmentHash);
      changes.push(...snapshot);
    }

    changes.push({ type: 'upload', path: ServerPathDto.SNAPSHOT_INFO, hash: pageObj.snapshot.info.hash });
    changes.push({ type: 'upload', path: ServerPathDto.SNAPSHOT_DATA, hash: pageObj.snapshot.data.hash });

    const comments = this.commentChanges(pageObj.comments.data);
    changes.push(...comments);
    return changes;
  };

  private drawChanges = (data: ObjDrawDto[]): ServerChangeDto[] => {
    const changes: ServerChangeDto[] = [];
    for (let i = 0; i < data.length; i++) {
      changes.push({ path: ServerPathDto.DRAW, type: 'upload', hash: data[i].hash });
    }
    return changes;
  };

  private commentChanges = (hashList: string[]): ServerChangeDto[] => {
    const changes: ServerChangeDto[] = [];
    for (let i = 0; i < hashList.length; i++) {
      changes.push({ path: ServerPathDto.COMMENT, type: 'upload', hash: hashList[i] });
    }
    return changes;
  };

  private snapshotChanges = async (contentHash: string): Promise<ServerChangeDto[]> => {
    const changes: ServerChangeDto[] = [];

    const pageSnapshot = await new PageSegmentGetCommand<SegmentPage>(contentHash).execute();
    if (!pageSnapshot) return [];

    // asserts
    const assets = pageSnapshot.content.assets;
    for (let i = 0; i < assets.length; i++) {
      changes.push({ path: ServerPathDto.PAGE_ASSETS, type: 'upload', hash: assets[i] });
    }

    // css
    const css = pageSnapshot.content.css;
    for (let i = 0; i < css.length; i++) {
      changes.push({ path: ServerPathDto.PAGE_CSS, type: 'upload', hash: css[i] });
    }
    return changes;
  };
}
