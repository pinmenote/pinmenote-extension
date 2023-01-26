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
import { ObjBookmarkDto } from './obj-bookmark.model';
import { ObjNoteDto } from './obj-note.model';
import { ObjPagePinDto } from './obj-pin.model';

export enum ObjViewTypeDto {
  Screenshot = 'SCREENSHOT',
  Html = 'HTML'
}

export interface ObjLocalDto {
  drawVisible: boolean;
  currentView: ObjViewTypeDto;
}

export interface ObjUrlDto {
  href: string;
  origin: string;
  pathname: string;
  search: string;
}

export interface ObjLinkDto {
  url: ObjUrlDto;
}

export interface ObjIdentityDto {
  user: string;
}

export interface ObjEncryptionDto {
  encrypted: boolean;
}

export enum ObjTypeDto {
  PageBookmark = 'PAGE_BOOKMARK',
  PageNote = 'PAGE_NOTE',
  ElementPin = 'ELEMENT_PIN',
  CanvasPin = 'CANVAS_PIN',
  PageLink = 'PAGE_LINK',
  Note = 'NOTE',
  Drawing = 'DRAWING'
}

type ObjDataDto = ObjPagePinDto | ObjBookmarkDto | ObjNoteDto;

export interface ObjDto {
  id: number;
  uid: string;
  version: number;
  type: ObjTypeDto;
  updatedAt: string;
  createdAt: string;
  local: ObjLocalDto;
  link?: ObjLinkDto;
  identity?: ObjIdentityDto;
  encryption: ObjEncryptionDto;
  hashtag: string[];
  data: ObjDataDto;
}
