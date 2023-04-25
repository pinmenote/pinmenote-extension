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
import { ObjDto, ObjTypeDto, ObjUrlDto } from './obj/obj.dto';

export interface ObjIdRangeResponse {
  ids: number[];
  listId: number;
}

export interface ObjRangeRequest {
  from: number;
  listId: number;
  limit: number;
  search?: string;
}

export interface ObjRangeResponse {
  listId: number;
  data: ObjDto[];
}

export interface PopupPinStartRequest {
  url: ObjUrlDto;
  type: ObjTypeDto;
}

export interface FetchCssRequest {
  url: string;
}

export interface FetchImageRequest {
  url: string;
}

export interface ExtensionPopupInitData {
  isAdding: boolean;
}
