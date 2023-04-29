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
import { ObjDrawDto } from './obj-draw.dto';
import { ObjSnapshotDto } from './obj-snapshot.dto';

export interface ObjCommentDto {
  username?: string;
  value: string;
  createdDate?: number;
}

export interface ObjCommentListDto {
  data: ObjCommentDto[];
}

export interface ObjPagePinDto {
  xpath: string;
  draw: ObjDrawDto[];
  comments: ObjCommentListDto;
  snapshot: ObjSnapshotDto;
  border: PinBorderDataDto;
}

export interface CssStyleListDto {
  css: CssStyleDto[];
}

export interface CssStyleDto {
  href?: string;
  data?: string;
  media?: string;
}

export interface PinBorderDataDto {
  radius: string;
  style: string;
}
