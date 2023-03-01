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
import { ObjBookmarkDto } from './obj-bookmark.dto';
import { ObjNoteDto } from './obj-note.dto';
import { ObjPagePinDto } from './obj-pin.dto';

export enum ObjBoardViewDto {
  Screenshot = 'SCREENSHOT',
  Html = 'HTML'
}

export const OBJ_DTO_VERSION = 1;

export interface ObjLocalDto {
  drawVisible?: boolean;
  boardView?: string;
  visible: boolean;
}

export interface ObjShareDto {
  url: string;
}

export interface ObjUrlDto {
  href: string;
  origin: string;
  pathname: string;
  search: string;
}

export interface ObjLinkDto {
  url: ObjUrlDto;
  xpath: string;
  value: string;
}

export interface ObjIdentityDto {
  id: number;
  user: string;
}

export interface ObjEncryptionDto {
  encrypted: boolean;
}

export enum ObjTypeDto {
  CodeSnippet = 'CODE_SNIPPET',
  Drawing = 'DRAWING',
  Note = 'NOTE',
  PageBookmark = 'PAGE_BOOKMARK',
  PageElementPin = 'ELEMENT_PIN',
  PageElementSnapshot = 'ELEMENT_SNAPSHOT',
  PageCanvasPin = 'PAGE_CANVAS_PIN',
  PageCanvasSnapshot = 'PAGE_CANVAS_SNAPSHOT',
  PageSnapshot = 'PAGE_SNAPSHOT',
  PageNote = 'PAGE_NOTE',
  Todo = 'TODO'
}

export interface ObjGroupNameDto {
  name: string;
  owner: string;
}

export interface ObjGroupDto {
  name: ObjGroupNameDto;
  members: string[];
}

export type ObjDataDto = ObjPagePinDto | ObjBookmarkDto | ObjNoteDto | ObjLinkDto;

export interface ObjDto<T = ObjDataDto> {
  id: number;
  version: number;
  type: ObjTypeDto;
  updatedAt: string;
  createdAt: string;
  local: ObjLocalDto;
  share?: ObjShareDto;
  identity?: ObjIdentityDto;
  group?: ObjGroupNameDto[];
  server?: string[];
  encryption: ObjEncryptionDto;
  hashtags: string[];
  data: T;
}
