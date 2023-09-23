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
import { ObjDto } from '../../../../common/model/obj/obj.dto';
import { ObjPinDataDto, ObjPinDescription, ObjPinDto } from '../../../../common/model/obj/obj-pin.dto';
import { SyncObjectCommand } from './sync-object.command';
import { SyncObjectStatus } from '../sync.model';
import { BeginTxResponse, SyncHashType } from '../../api/store/api-store.model';
import { ApiSegmentAddCommand } from '../../api/store/segment/api-segment-add.command';
import { PinGetCommentCommand } from '../../../../common/command/pin/comment/pin-get-comment.command';
import { ObjDrawDto } from '../../../../common/model/obj/obj-draw.dto';
import { ObjVideoDataDto } from '../../../../common/model/obj/page-snapshot.dto';

const TEMP_KEY = 'foo';

export class SyncPinCommand implements ICommand<Promise<SyncObjectStatus>> {
  constructor(private obj: ObjDto<ObjPinDto>, private tx: BeginTxResponse) {}
  async execute(): Promise<SyncObjectStatus> {
    const data = this.obj.data;
    await new SyncObjectCommand(this.obj, data.data.hash, this.tx).execute();

    await this.syncPinData(data.data);
    await this.syncPinDescription(data.description, data.data.hash);
    await this.syncPinComments(data.comments.data, data.data.hash);
    await this.syncPinDraw(data.draw.data, data.data.hash);
    await this.syncPinVideo(data.data.hash, data.video);

    return SyncObjectStatus.OK;
  }

  private syncPinVideo = async (parent: string, data?: ObjVideoDataDto) => {
    if (!data) return;
    const content = JSON.stringify(data);
    await new ApiSegmentAddCommand(this.tx, content, {
      hash: data.hash,
      parent,
      type: SyncHashType.ObjVideoDataDto,
      key: TEMP_KEY
    }).execute();
  };

  private syncPinDraw = async (data: ObjDrawDto[], parent: string) => {
    for (const draw of data) {
      // TODO SYNC DRAW LIKE COMMENTS
      const content = JSON.stringify(draw);
      await new ApiSegmentAddCommand(this.tx, content, {
        hash: draw.hash,
        parent,
        type: SyncHashType.ObjDrawDto,
        key: TEMP_KEY
      }).execute();
    }
  };

  private syncPinComments = async (data: string[], parent: string) => {
    for (const hash of data) {
      const comment = await new PinGetCommentCommand(hash).execute();
      if (!comment) continue;
      const content = JSON.stringify(comment);
      await new ApiSegmentAddCommand(this.tx, content, {
        hash: comment.hash,
        parent,
        type: SyncHashType.ObjCommentDto,
        key: TEMP_KEY
      }).execute();
    }
  };

  private syncPinData = async (data: ObjPinDataDto) => {
    const content = JSON.stringify(data);
    await new ApiSegmentAddCommand(this.tx, content, {
      hash: data.hash,
      parent: data.hash,
      type: SyncHashType.ObjPinDataDto,
      key: TEMP_KEY
    }).execute();
  };

  private syncPinDescription = async (data: ObjPinDescription, parent: string) => {
    const content = JSON.stringify(data);
    await new ApiSegmentAddCommand(this.tx, content, {
      hash: data.hash,
      parent,
      type: SyncHashType.ObjPinDescription,
      key: TEMP_KEY
    }).execute();
  };
}
