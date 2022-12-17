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
import { HtmlContent, HtmlObject } from '@common/model/html.model';
import PinSize = Pinmenote.Pin.PinSize;
import PinUrl = Pinmenote.Pin.PinUrl;
import ShareUrlDto = Pinmenote.Share.ShareUrlDto;

export const PIN_HASHTAG_REGEX = new RegExp(/#(\w+)/g);

export enum PinViewType {
  SCREENSHOT = 1,
  CONTENT = 2
}

export interface PinPopupInitData {
  url?: PinUrl;
  isAddingNote: boolean;
}

/* CONTENT */

export interface PinObject extends HtmlObject {
  id: number;
  version: number;
  createdDate: string;
  updatedDate: string;
  visible: boolean;
  screenshot?: string;
  content: HtmlContent;
  viewType: PinViewType;
  size: PinSize;
  share?: ShareUrlDto;
  border: {
    radius: string;
    style: string;
  };
}

export interface PinUpdateObject {
  pin: PinObject;
  oldHashtag?: string[];
  newHashtag?: string[];
}

export interface PinRangeRequest {
  from: number;
  limit?: number;
  search?: string;
}

export interface PinByIdRequest {
  id: number;
}
