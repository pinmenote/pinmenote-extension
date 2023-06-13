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
  COMMENT = 'comment',
  DRAW = 'draw',
  NOTE = 'note',
  PAGE_ASSETS = 'page/assets',
  PAGE_CSS = 'page/css',
  PIN = 'pin',
  SNAPSHOT_INFO = 'snapshot/info',
  SNAPSHOT_DATA = 'snapshot/data'
}

export interface ServerChangeDto {
  hash: string;
  path: ServerPathDto;
  type: 'download' | 'upload' | 'remove';
}

export interface ServerObjDto {
  change: ServerChangeDto;
  data: string;
}

export interface ObjServerDto {
  id?: number;
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
