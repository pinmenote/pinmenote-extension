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
import { ObjCanvasDto, ObjVideoDataDto } from './obj-snapshot.dto';
import { ObjCommentListDto } from './obj-comment.dto';
import { ObjDrawDto } from './obj-draw.dto';
import { ObjUrlDto } from './obj.dto';

export interface ObjDrawListDto {
  data: ObjDrawDto[];
}

export interface PinIframeDto {
  index: string;
  url: ObjUrlDto;
}

interface ObjPinDataDto {
  hash: string;
  url: ObjUrlDto;
  xpath: string;
  screenshot: string;
  border: PinBorderDataDto;
  iframe?: PinIframeDto;
  canvas?: ObjCanvasDto;
}

interface ObjPinDescription {
  hash: string;
  title: string;
}

export interface ObjPinDto {
  description: ObjPinDescription;
  data: ObjPinDataDto;
  draw: ObjDrawListDto;
  comments: ObjCommentListDto;
  video?: ObjVideoDataDto;
}

export interface PinBorderDataDto {
  radius: string;
  style: string;
}
