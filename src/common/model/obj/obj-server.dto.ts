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

export enum ServerPathDto {
  OBJ = 'obj',
  HASHTAGS = 'page/hashtags',
  PAGE_COMMENTS = 'page/comments',
  PAGE_DRAW = 'page/draw',
  PAGE_NOTE = 'page/note',
  PAGE_PIN = 'page/pin',
  SNAPSHOT = 'page/snapshot',
  SNAPSHOT_CONTENT = 'page/snapshot/content',
  SNAPSHOT_CSS = 'page/snapshot/css'
}

export interface ServerChangeDto {
  id?: number;
  path: ServerPathDto;
  type: 'download' | 'upload';
}

export interface ServerObjDto {
  change: ServerChangeDto;
  data: string;
}

export enum ObjSyncStatusDto {
  DOWNLOAD = 'DOWNLOAD', // receiving changes from server
  UPLOAD = 'UPLOAD', // sending changes to server
  GATHER = 'GATHER', // gathering changes to send
  OK = 'OK'
}

export interface ObjServerDto {
  id?: number;
  status: ObjSyncStatusDto;
  changes: ServerChangeDto[];
}

// server responses
export enum ObjStatusDto {
  ERROR = -1,
  OK = 0,
  UPDATE = 1
}

export interface ObjResultDto {
  result: ObjStatusDto;
}

export interface ObjAddResultDto extends ObjResultDto {
  serverId: number;
}
