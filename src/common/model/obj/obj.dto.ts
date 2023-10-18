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
import { ObjNoteDto, ObjPageNoteDto } from './obj-note.dto';
import { ObjPageDto } from './obj-page.dto';
import { ObjPdfDto } from './obj-pdf.dto';
import { ObjPinDto } from './obj-pin.dto';
import { ObjServerDto } from './obj-server.dto';

export const OBJ_DTO_VERSION = 1;

export interface ObjLocalDto {
  drawVisible?: boolean;
  visible?: boolean;
}

export interface ObjUrlDto {
  href: string;
  origin: string;
  pathname: string;
  search: string;
}

export enum ObjTypeDto {
  PageElementPin = 'ELEMENT_PIN',
  PageElementSnapshot = 'ELEMENT_SNAPSHOT',
  PageSnapshot = 'PAGE_SNAPSHOT',
  PageNote = 'PAGE_NOTE',
  PageAlter = 'PAGE_ALTER',
  Note = 'NOTE',
  Pdf = 'PDF',
  Removed = 'REMOVED'
}

export interface ObjRemovedDto {
  id: number;
  server?: ObjServerDto;
  type: ObjTypeDto;
  hash: string;
  removedAt: number;
}

export type ObjDataDto = ObjPageDto | ObjPinDto | ObjPdfDto | ObjNoteDto | ObjPageNoteDto | ObjRemovedDto;
export type ObjPageDataDto = ObjPageDto | ObjPageNoteDto | ObjPinDto | ObjPdfDto;

export interface ObjDto<T = ObjDataDto> {
  id: number;
  version: number;
  server?: ObjServerDto;
  type: ObjTypeDto;
  updatedAt: number;
  createdAt: number;
  local: ObjLocalDto;
  data: T;
}
