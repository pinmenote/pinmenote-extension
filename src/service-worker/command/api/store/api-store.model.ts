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
import { ObjTypeDto } from '../../../../common/model/obj/obj.dto';

export interface BeginTxResponse {
  tx: string;
  locked: boolean;
  lockExpire: number;
  lockedBy?: string;
  lockReason?: string;
  refreshToken: boolean;
  resetStorage: boolean;
}

export interface ObjSingleChange {
  localId: number;
  serverId: number;
  deletedId: number;
  type: ObjTypeDto;
  createdAt: number;
  hash: string;
}

export interface ObjChangesResponse {
  data: ObjSingleChange[];
}

export enum SyncHashType {
  PageSnapshotDataDto = '1',
  PageSnapshotInfoDto = '2',
  PageSnapshotFirstHash = '3',
  IFrame = '4',
  Img = '5',
  Css = '6',
  Snapshot = '7',
  ObjPdfDataDto = '8',
  ObjPdf = '9',
  ObjPageNoteDto = '10',
  ObjPinDataDto = '11',
  ObjPinDescription = '12',
  ObjCommentDto = '13',
  ObjDrawDto = '14',
  ObjVideoDataDto = '15'
}

export interface SegmentSingleHash {
  type: SyncHashType;
  hash: string;
  mimeType?: string;
}

export interface SegmentHashListResponse {
  hash: string;
  children: SegmentSingleHash[];
}
