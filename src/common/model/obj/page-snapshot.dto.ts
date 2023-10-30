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
import { ObjRectangleDto, ObjSizeDto } from './obj-utils.dto';
import { ObjUrlDto } from './obj.dto';

export interface PageCanvasDto {
  windowSize: ObjSizeDto;
  rect: ObjRectangleDto;
}

export interface PageSnapshotInfoDto {
  hash: string;
  url: ObjUrlDto;
  title: string;
  words: string[];
}

export interface PageSnapshotDataDto {
  hash: string;
  xpath?: string;
  canvas?: PageCanvasDto;
  screenshot: string;
}

export interface PageSnapshotDto {
  data: PageSnapshotDataDto;
  info: PageSnapshotInfoDto;
  hash: string; // combined hash of data + info + segment
  segment?: string; // SegmentPage
}

export interface ObjVideoDataDto {
  hash: string;
  xpath: string;
  time: ObjVideoTimeDto[];
}

export interface ObjVideoTimeDto {
  currentTime: number;
  displayTime: number;
}
