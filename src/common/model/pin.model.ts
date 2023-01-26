/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { HtmlContent, HtmlObject } from './html.model';
import ShareUrlDto = Pinmenote.Share.ShareUrlDto;
import { ObjUrlDto } from './obj.model';

export enum PinViewType {
  SCREENSHOT = 1,
  CONTENT = 2
}

export interface PinPopupInitData {
  url?: ObjUrlDto;
  isAddingNote: boolean;
  pageTitle: string;
}

/* CONTENT */

export interface PinObject extends HtmlObject {
  id: number;
  version: number;
  visible: boolean;
  screenshot?: string;
  content: HtmlContent;
  viewType: PinViewType;
  share?: ShareUrlDto;
  border: {
    radius: string;
    style: string;
  };
}

export interface PinRangeRequest {
  from: number;
  listId: number;
  limit: number;
  search?: string;
}

export interface PinRangeResponse {
  listId: number;
  data: PinObject[];
}

export interface PinByIdRequest {
  id: number;
}
