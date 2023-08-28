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
import { ObjBinaryDto } from './obj-binary.dto';
import { ObjNoteDto } from './obj-note.dto';
import { ObjPageDto } from './obj-page.dto';
import { ObjPdfDto } from './obj-pdf.dto';
import { ObjPinDto } from './obj-pin.dto';

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
  Note = 'Note',
  PageAlter = 'PAGE_ALTER',
  PageTask = 'PAGE_TASK',
  Pdf = 'PDF',
  Image = 'IMAGE'
}

export type ObjDataDto = ObjPageDto | ObjNoteDto | ObjPinDto | ObjBinaryDto | ObjPdfDto;
export type ObjPageDataDto = ObjPageDto | ObjNoteDto | ObjPinDto | ObjPdfDto;

export interface ObjDto<T = ObjDataDto> {
  id: number;
  version: number;
  type: ObjTypeDto;
  updatedAt: number;
  createdAt: number;
  local: ObjLocalDto;
  data: T;
}
