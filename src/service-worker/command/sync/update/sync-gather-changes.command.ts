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
import { ObjCommentDto, ObjPageDto } from '../../../../common/model/obj/obj-pin.dto';
import { ObjDto, ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { ServerChangeDto, ServerPathDto } from '../../../../common/model/obj/obj-server.dto';
import { ICommand } from '../../../../common/model/shared/common.dto';
import { ObjDrawDto } from '../../../../common/model/obj/obj-draw.dto';
import { ObjGetSnapshotContentCommand } from '../../../../common/command/obj/content/obj-get-snapshot-content.command';

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
        const pageObj = this.obj.data as ObjPageDto;
        changes = await this.pageChanges(pageObj);
        changes.push({ type: 'upload', path: ServerPathDto.PIN });
        break;
      }
      case ObjTypeDto.PageNote: {
        changes.push({ type: 'upload', path: ServerPathDto.NOTE });
        changes.push({ type: 'upload', path: ServerPathDto.HASHTAGS });
      }
    }
    return changes;
  }

  private pageChanges = async (pageObj: ObjPageDto): Promise<ServerChangeDto[]> => {
    const changes: ServerChangeDto[] = [];
    changes.push({ path: ServerPathDto.SNAPSHOT, type: 'upload' });
    changes.push({ path: ServerPathDto.HASHTAGS, type: 'upload' });

    const snapshot = await this.snapshotChanges(pageObj.snapshot.contentId);
    changes.push(...snapshot);

    const comments = this.commentChanges(pageObj.comments.data);
    changes.push(...comments);

    const draw = this.drawChanges(pageObj.draw);
    changes.push(...draw);
    return changes;
  };

  private drawChanges = (data: ObjDrawDto[]): ServerChangeDto[] => {
    const changes: ServerChangeDto[] = [];
    for (let i = 0; i < data.length; i++) {
      changes.push({ path: ServerPathDto.DRAW, type: 'upload', id: i });
    }
    return changes;
  };

  private commentChanges = (data: ObjCommentDto[]): ServerChangeDto[] => {
    const changes: ServerChangeDto[] = [];
    for (let i = 0; i < data.length; i++) {
      changes.push({ path: ServerPathDto.COMMENT, type: 'upload', id: i });
    }
    return changes;
  };

  private snapshotChanges = async (contentId: number): Promise<ServerChangeDto[]> => {
    if (contentId === -1) return [];
    const changes: ServerChangeDto[] = [];

    const snapshotContent = await new ObjGetSnapshotContentCommand(contentId).execute();

    // content
    const content = snapshotContent.snapshot.content;
    for (let i = 0; i < content.length; i++) {
      changes.push({ path: ServerPathDto.SNAPSHOT_CONTENT, type: 'upload', id: i });
    }

    // css
    const css = snapshotContent.snapshot.css.css;
    for (let i = 0; i < css.length; i++) {
      changes.push({ path: ServerPathDto.SNAPSHOT_CSS, type: 'upload', id: i });
    }
    return changes;
  };
}
