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
import { ObjCanvasDto, ObjSnapshotDto, ObjVideoDataDto } from './obj-snapshot.dto';
import { ObjDrawDto } from './obj-draw.dto';
import { ObjUrlDto } from './obj.dto';

export interface ObjCommentDto {
  value: string;
  hash: string;
  prev?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ObjCommentListDto {
  data: string[];
}

export interface ObjDrawListDto {
  data: ObjDrawDto[];
}

export interface ObjPageDto {
  snapshot: ObjSnapshotDto;
  comments: ObjCommentListDto;
}

export interface PinIframeDto {
  index: string;
  url: ObjUrlDto;
}

export interface ObjPinDto {
  hash: string;
  url: ObjUrlDto;
  iframe?: PinIframeDto;
  xpath: string;
  border: PinBorderDataDto;
  title: string;
  screenshot: string;
  draw: ObjDrawListDto;
  comments: ObjCommentListDto;
  canvas?: ObjCanvasDto;
  video?: ObjVideoDataDto;
}

export interface PinBorderDataDto {
  radius: string;
  style: string;
}
