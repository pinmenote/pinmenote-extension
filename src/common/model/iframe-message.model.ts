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
import { ObjTypeDto, ObjUrlDto } from './obj/obj.dto';
import { ObjSnapshotContentDto } from './obj/obj-content.dto';

export interface IFrameIndexMessage {
  index: string;
  uid: string;
}

export interface IFrameListenerMessage extends IFrameIndexMessage {
  type: ObjTypeDto;
  url: ObjUrlDto;
}

export interface IFrameFetchMessage {
  uid: string;
  href: string;
  data: ObjSnapshotContentDto;
}
